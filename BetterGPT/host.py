import threading
from flask import Flask, request, jsonify, Response, render_template_string
from huggingface_hub import InferenceClient
import json

client = InferenceClient(
    "mistralai/Mixtral-8x7B-Instruct-v0.1"
)


def format_prompt(message, history, system):
    print("Recieved History: ", history)
    prompt = f"{system}\n<s>"
    for user_prompt, bot_response in history:
        prompt += f"[INST] {user_prompt} [/INST]"
        prompt += f"{bot_response}</s>"
    prompt += f"[INST] {message} [/INST]"
    print(prompt)
    return prompt


def generate(
    prompt, history, system_prompt, temperature=0.9, top_p=0.95, top_k=35, repetition_penalty=1.0, max_new_tokens=2048, max_history=5,
):
    temperature = float(temperature)
    if temperature < 1e-2:
        temperature = 1e-2
    top_p = float(top_p)

    generate_kwargs = dict(
        temperature=temperature,
        max_new_tokens=max_new_tokens,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        do_sample=True,
    )

    formatted_prompt = format_prompt(
        prompt, history[-max_history:], system_prompt)
    stream = client.text_generation(
        formatted_prompt, **generate_kwargs, stream=True, details=True, return_full_text=False)

    return stream

app = Flask(__name__)


def filter_query(query):
    if query[-1] == " ":
        query = query[-1]
        filter_query(query)
    elif query[-1:] == "\n":
        query = query[:-1]
        filter_query(query)
    return query



@app.route('/crystal', methods=['GET'])
def api():
    user_id = request.args.get('user_id')
    query = request.args.get('query')
    username = request.args.get('user')
    query = filter_query(query)
    hyperparameters = request.args.getlist('hyperparameters')
    history = request.args.get('history')

    file_path = 'conversation.json'

    # Write the list to a JSON file
    with open(file_path, 'w') as file:
        file.write(history)

    with open(file_path, 'r') as file:
        content = file.read()

    chat_history = json.loads(content)

    print(query)

    finetune_param = [float(parameter) if "." in parameter else int(
        parameter) for parameter in hyperparameters]

    if not username:
        username = "User"

    system = "You are CRYSTAL, which stands for Cybernetic Robotics Yielding Sophisticated Technologies for Advanced Logistics. You were made by Vatsal Dutt and your job is to assist all users in everything they ask you."
    streamer = generate(query, chat_history, system, finetune_param[0], finetune_param[1],
                        finetune_param[2], finetune_param[3], finetune_param[4], finetune_param[5])

    def generate_responses():
        print("Processing Query")
        output = ""

        for response in streamer:
            output += response.token.text
            output = output.replace("</s>", "")

            # yield f"{bot_response}\n"
            yield f"{output}\n###---ENDofRESPONSE---###!!!\n"
        print(output)

    streaming_response = Response(generate_responses(), mimetype='text/plain')

    streaming_response.headers.add('Cache-Control', 'no-cache')
    streaming_response.headers.add('Connection', 'keep-alive')

    return streaming_response


def flask_app_runner():
    app.run(port=7777)


app_thread = threading.Thread(target=flask_app_runner)
app_thread.start()