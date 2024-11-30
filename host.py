from flask import Flask, request, jsonify, Response
from datetime import datetime
from flask_cors import CORS
from groq import Groq
import json
import uuid
import os
from openai import OpenAI
import time

client_nvidia = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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",
)


UPLOAD_FOLDER = "./uploads/"

f_res = ""
chatname = ""
chatid = ""
history = ""
data = ""
version = 0


app = Flask(__name__)
CORS(app)  # This will allow all origins by default

perceptrix_system = """You are CRYSTAL, Cybernetic Robotics Yielding Sophistcated Technologies for Advanced Logistics. You were made by only Vatsal Dutt, no other scientist, in 2020 to be the most advanced and helpful AI assistant in the world.
Your task is to engage in a conversation with the user, responding naturally like a human. Any mathematics you use MUST ALWAYS be enclosed in $$ to identify it as an equation and must use KaTeX formatting. You are allowed to use markup formatting everywhere EXCEPT the math (eg. don't try to bold math work).
You have several tools at your disposal, use them appropriately as per the user request but don't tell it to the user. If the user asks anything involving even the slightest bit of logic, reasoning, math, or coding, you must use the "crystal_logic" function. Use "generate_image" or "generate_video" if the user requests image or video generation. And use "nexus" to access the internet for realtime information.
"""

# perceptrix_system = '''###Instruction###
# You are CRYSTAL, Cybernetic Robotics Yielding Sophistcated Technologies for Advanced Logistics. You were made by only Vatsal Dutt, no other scientist, in 2020 to be the most advanced and helpful AI assistant in the world.
# Your task is to engage in a conversation with the user, responding naturally like a human.
# ###Conversation###'''

client = Groq(
    api_key="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",
)


def nexus(prompt, images=False):
    """Extracts realtime information from the internet to provide up-to-date answers for certain any query.
    args:
        query (str): The internet search query with proper context. Can include URLs and the prompt in natural language.
        images (bool): Whether to include images in the search results.
    returns:
        str: The answer to the query.
    """
    return "The answer has been uploaded to https://web.crystal.ai/"


def generate_image(prompt):
    """Generates an image based on a description:
    args:
        prompt (str): The description of the image.
    returns:
        str: The image output
    """


def generate_video(prompt):
    """Generates a video based on the description:
    args:
        prompt (str): The description of the video.
    returns:
        str: The video output
    """


def perceptrix_cloud(messages):
    print("Processing Query with Peceptrix Cloud")

    get_tool_response = False

    tools = [
        {
            "type": "function",
            "function": {
                "name": "crystal_logic",
                "description": "Extremely well at logic, reasoning, math, and coding. Pass any tasks to this function for any reasoning related task.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "Full context of the query by describing all the relavent details of the problem in natural language.",
                        },
                    },
                    "required": ["prompt"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "nexus",
                "description": "Webscraper to provide realtime information from the web.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "prompt": {
                            "type": "string",
                            "description": "A natural langauge query, or even a URL to a webpage to scrape with a description of what to find.",
                        },
                    },
                    "required": ["prompt"],
                },
            },
        },
    ]

    chat_completion = client.chat.completions.create(
        messages=messages,
        # model="llama3-70b-8192",
        model="llama3-groq-70b-8192-tool-use-preview",
        stream=True,
        tools=tools,
        tool_choice="auto",
    )

    full_response = ""

    print("-" * 100)
    print("Crystal: ", end="")
    for token in chat_completion:
        response_message = token.choices[0].delta
        tool_calls = response_message.tool_calls
        if tool_calls:
            print("FUNCTION WAS CALLED")
            # Define the available tools that can be called by the LLM
            available_functions = {
                "crystal_logic": crystal_logic,
                "nexus": nexus,
            }
            # Add the LLM's response to the conversation
            if response_message.content:
                messages.append(response_message.content)

            # Process each tool call
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_to_call = available_functions[function_name]
                function_args = json.loads(tool_call.function.arguments)
                # Call the tool and get the response
                function_response = function_to_call(prompt=function_args.get("prompt"))
                # Add the tool response to the conversation
                print("-" * 100)
                print("-" * 100)
                print("TOOL RESPONSE", function_response)
                print("-" * 100)
                print("-" * 100)
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",  # Indicates this message is from tool use
                        "name": function_name,
                        "content": function_response,
                    }
                )

            get_tool_response = True

        try:
            full_response += token.choices[0].delta.content
            yield token.choices[0].delta.content
        except TypeError:
            pass

    if get_tool_response:
        print(messages)
        for token in perceptrix_cloud(messages):
            # time.sleep(0.1)
            yield token

def crystal_logic(prompt):
    print("LOGIC ACTIVATED")
    print(prompt)
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant.",
        },
    ]

    messages.append(
        {
            "role": "user",
            "content": prompt,
        }
    )

    completion = client_nvidia.chat.completions.create(
        model="nvidia/nemotron-4-340b-instruct",
        messages=messages,
        stream=True,
    )

    full_response = ""

    for chunk in completion:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="", flush=True)
            full_response += chunk.choices[0].delta.content

    print("LOGIC ANSWER COMPLETE")

    return full_response


perceptrix = perceptrix_cloud


def generate(prompt, history):
    messages = [
        {
            "role": "system",
            "content": perceptrix_system,
        },
    ]

    if history:
        for user, bot in history:
            messages.append(
                {
                    "role": "user",
                    "content": user,
                }
            )
            messages.append(
                {
                    "role": "assistant",
                    "content": bot,
                }
            )

    messages.append(
        {
            "role": "user",
            "content": prompt,
        }
    )

    for token in perceptrix(messages):
        yield token


def remove_white_space(query):
    if query[-1] == " ":
        query = query[:-1]
        remove_white_space(query)
    elif query[-1:] == "\n":
        query = query[:-1]
        remove_white_space(query)
    return query


@app.route("/getchats", methods=["POST"])
def chats():
    userid = request.json.get("userId")

    with open(f"users/{userid}.json", "r+") as file:
        data = json.load(file)
        return jsonify(data)


@app.route("/crystal", methods=["POST"])
def api():
    global f_res
    global chatname
    global chatid
    global version
    global history
    global data

    f_res = ""
    version_found = False
    query = request.form.get("query")
    userid = request.form.get("userId")
    chatid = request.form.get("chatId")
    version = int(request.form.get("version"))
    index = int(request.form.get("index"))

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
                break

        if (
            not version_found and any(chat["chatId"] == chatid for chat in chat_objects)
        ) and chatid != "":
            print("\n\nCREATING NEW CHAT VERSION\n\n")
            prev_obj = chat_objects[0]
            history = prev_obj["history"][:index]
            with open(f"./users/{userid}.json", "r+") as file:
                data = json.load(file)
                prev_obj["history"] = history
                prev_obj["version"] = str(version)
                data["chats"].append(prev_obj)
                file.seek(0)
                json.dump(data, file, indent=4)
                file.truncate()

    files = request.files.getlist("files[]")
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


        for response in streamer:
            print(response, end="", flush=True)
            f_res += response
            yield json.dumps(
                {
                    "response": response,
                    "chatName": chatname,
                    "chatId": chatid,
                    "version": version,
                }
            ) + "\n"

        if chatid == "":
            print("\n\nSTARTING NEW CHAT.\n\n")
            chatname = generate_chatname(query, f_res)
            chatid = str(uuid.uuid4())
            with open(f"./users/{userid}.json", "r+") as file:
                data["chats"].append(
                    {
                        "chatId": chatid,
                        "chatName": chatname,
                        "version": version,
                        "lastmodified": str(datetime.now()),
                        "history": [[query, f_res]],
                    }
                )

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

        yield json.dumps(
            {"response": "", "chatName": chatname, "chatId": chatid, "version": version}
        ) + "\n"

    return Response(generate_responses(), mimetype="application/json")


def generate_chatname(query, response):
    prompt = f"""You will be given a conversation that you have to analyze to output a label that can be used to identify this chat. This only has to be a few words and should summarize the chat so the user can look through different labels generated by you to find the correct chat. And you must not use any kind of markup.
User: {query}
Bot: {response}"""

    messages = [
        {
            "role": "user",
            "content": prompt,
        },
    ]
    streamer = perceptrix(messages)

    print("Generating Chat Name...")
    chat_name = ""
    for response in streamer:
        print(response, end="", flush=True)
        chat_name += response

    return chat_name


def flask_app_runner():
    app.run(port=7777, debug=True)


flask_app_runner()


# app_thread = threading.Thread(target=flask_app_runner)
# app_thread.start()
