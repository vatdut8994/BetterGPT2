from flask import Flask, request, jsonify, Response
from datetime import datetime
from flask_cors import CORS
from groq import Groq
import threading
import json
import uuid
import os


UPLOAD_FOLDER = './uploads/'

f_res = ""
chatname = ""
chatid = ""
history = ""
data = ""
version = 0


app = Flask(__name__)
CORS(app)  # This will allow all origins by default

perceptrix_system = '''###Instruction###
You are CRYSTAL, Cybernetic Robotics Yielding Sophistcated Technologies for Advanced Logistics. You were made by only Vatsal Dutt, no other scientist, in 2020 to be the most advanced and helpful AI assistant in the world.
Your task is to engage in a conversation with the user, responding naturally like a human. Any mathematics you use MUST ALWAYS be enclosed in $$ or [] to identify it as an equation and must use KaTeX formatting.
###Conversation###'''

# perceptrix_system = '''###Instruction###
# You are CRYSTAL, Cybernetic Robotics Yielding Sophistcated Technologies for Advanced Logistics. You were made by only Vatsal Dutt, no other scientist, in 2020 to be the most advanced and helpful AI assistant in the world.
# Your task is to engage in a conversation with the user, responding naturally like a human.
# ###Conversation###'''

client = Groq(
    api_key="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",
)


def perceptrix_cloud(prompt, perceptrix_system=perceptrix_system):
    messages = [
        {
            "role": "system",
            "content": perceptrix_system,
        },
    ]

    messages.append({"role": "user",
                     "content": prompt, })

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama3-70b-8192",
        stream=True,
    )

    full_response = ""

    for token in chat_completion:
        try:
            full_response += token.choices[0].delta.content
            yield token.choices[0].delta.content
        except TypeError:
            pass


def generate(prompt, history):
    history_str = ""

    if history:
        for user, bot in history:
            history_str += f"User: {user}\nCRYSTAL: {bot}\n"

    history_str += f"User: {prompt}\nCRYSTAL: "

    for token in perceptrix_cloud(history_str):
        yield token


def remove_white_space(query):
    if query[-1] == " ":
        query = query[:-1]
        remove_white_space(query)
    elif query[-1:] == "\n":
        query = query[:-1]
        remove_white_space(query)
    return query


@app.route('/getchats', methods=['POST'])
def chats():
    userid = request.json.get('userId')
    print(userid)

    with open(f"users/{userid}.json", "r+") as file:
        data = json.load(file)
        return jsonify(data)


@app.route('/crystal', methods=['POST'])
def api():
    global f_res
    global chatname
    global chatid
    global version
    global history
    global data

    f_res = ""
    version_found = False
    query = request.form.get('query')
    userid = request.form.get('userId')
    chatid = request.form.get('chatId')
    version = int(request.form.get('version'))
    index = int(request.form.get('index'))
    print(query)
    print(userid)
    print(chatid)
    print(version)
    print(index)

    chatname = ""

    with open(f"./users/{userid}.json", "r+") as file:
        data = json.load(file)
        chats = data["chats"]
        chat_objects = []
        history = []

        # Select all the versions of the requested chat
        for chat in chats:
            if chat["chatId"] == chatid:
                chat_objects.append(chat)

        # Sort the list by last modified
        chat_objects.sort(key=lambda x: x["lastmodified"], reverse=True)

        # Scan to find the correct version of the chat
        for chat in chat_objects:
            if int(chat["version"]) == version:
                print("\n\nFOUNDHISTORY\n\n")
                history = chat["history"]
                chatname = chat["chatName"]
                version_found = True
                print(history)
                print(chatname)
                break

        if (not version_found and any(chat["chatId"] == chatid for chat in chat_objects)) and chatid != "":
            print("\n\nCREATING NEW CHAT VERSION\n\n")
            prev_obj = chat_objects[0]
            print(prev_obj["history"])
            history = prev_obj["history"][:index]
            with open(f"./users/{userid}.json", "r+") as file:
                data = json.load(file)
                prev_obj["history"] = history
                prev_obj["version"] = str(version)
                data["chats"].append(prev_obj)
                file.seek(0)
                json.dump(data, file, indent=4)
                file.truncate()

    files = request.files.getlist('files[]')
    saved_files = []

    # Wait for all files to be downloaded
    for file in files:
        # Save the file in the specified upload folder
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        saved_files.append(file.filename)

    # All files have been downloaded, now process the query
    query = remove_white_space(query)

    # Start streaming after files are downloaded
    streamer = generate(query, history)

    def generate_responses():
        global f_res
        global chatname
        global chatid
        global history
        global data
        global version

        print("Processing Query")
        for response in streamer:
            print(response, end='', flush=True)
            f_res += response
            yield json.dumps({"response": response, "chatName": chatname, "chatId": chatid, "version": version}) + "\n"

        if chatid == "":
            print("\n\nSTARTING NEW CHAT.\n\n")
            chatname = generate_chatname(query, f_res)
            chatid = str(uuid.uuid4())
            with open(f"./users/{userid}.json", "r+") as file:
                data["chats"].append({"chatId": chatid,
                                    "chatName": chatname,
                                    "version": version,
                                    "lastmodified": str(datetime.now()),
                                    "history": [[query, f_res]]})

                file.seek(0)
                json.dump(data, file, indent=4)
                file.truncate()
        else:
            print("\n\nADDING TO EXISTING CHAT.\n\n")
            with open(f"./users/{userid}.json", "r+") as file:
                history.append([query, f_res])
                for chat_idx, chat in enumerate(data["chats"]):
                    if chat["chatId"] == chatid:
                        data["chats"][chat_idx]["history"] = history
                        data["chats"][chat_idx]["lastmodified"] = str(datetime.now())
                        break
                file.seek(0)
                json.dump(data, file, indent=4)
                file.truncate()

        yield json.dumps({"response": response, "chatName": chatname, "chatId": chatid, "version": version}) + "\n"

    return Response(generate_responses(), mimetype='application/json')


def generate_chatname(query, response):
    prompt = f"""You will be given a conversation that you have to analyze to output a label that can be used to identify this chat. This only has to be a few words and should summarize the chat so the user can look through different labels generated by you to find the correct chat. And you must not use any kind of markup.
User: {query}
Bot: {response}"""

    print(prompt)

    streamer = perceptrix_cloud(prompt)

    print("Generating Chat Name...")
    chat_name = ""
    for response in streamer:
        print(response, end='', flush=True)
        chat_name += response

    return chat_name


def flask_app_runner():
    app.run(port=7777)


app_thread = threading.Thread(target=flask_app_runner)
app_thread.start()
