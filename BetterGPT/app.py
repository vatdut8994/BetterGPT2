from flask import Flask, request, render_template, send_file
from urllib.request import urlopen
import threading
import requests
import datetime
import logging
import json
import time
import re

app = Flask(__name__)
app.logger.setLevel(logging.WARNING)

pwd = "."
url = f"https://bceb7f41087d-7754001953109090881.ngrok-free.app/crystal"

content = "[]"

# Set file paths
reply_file_path = f"{pwd}/reply.txt"
query_file_path = f"{pwd}/query.txt"
parameters_file_path = f"{pwd}/parameters.txt"
history = f"{pwd}/history.json"

with open(history, "w") as params_file:
        params_file.write("[]")


def clear_files():
    with open(reply_file_path, "w") as reply_file, \
            open(query_file_path, "w") as query_file, \
            open(parameters_file_path, "w") as params_file:
        reply_file.write("")
        query_file.write("")
        params_file.write("0.9\n0.95\n35\n1.0\n1024\n5")


clear_files()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/reply.txt')
def serve_reply():
    return send_file(reply_file_path)


@app.route('/write-file', methods=['POST'])
def write_file():
    data = request.get_json()
    filename = data.get('filename')
    file_content = data.get('data')

    try:
        with open(filename, 'w') as file:
            file.write(file_content)
        return 'File written successfully', 200
    except Exception as e:
        return str(e), 500


def get_time():
    current_time = datetime.datetime.now()
    formatted_time = current_time.strftime("%I:%M:%S %p")
    return formatted_time


def get_ip():
    try:
        response = urlopen('http://checkip.dyndns.com/')
        html = response.read().decode('utf-8')
        ip_address = re.search(
            r'Address: (\d+\.\d+\.\d+\.+\d+)', html).group(1)
        return ip_address
    except Exception as e:
        print(f"Error retrieving IP address: {str(e)}")
        return "Error retrieving IP address"


def answer():
    global content
    while True:
        with open(query_file_path, 'r') as query_file:
            query = query_file.read().strip()

        if query:
            with open(parameters_file_path, 'r') as params_file:
                parameters = params_file.readlines()

            with open(history, 'r') as file:
                content = file.read()

            # Parse the JSON content into a Python list

            payload = {
                "user_id": get_ip(),
                "query": query,
                "hyperparameters": parameters,
                "history": str(content)
            }
            print(content)

            response = requests.get(url, params=payload, stream=True)
            full_response = ""
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    if line == "###---ENDofRESPONSE---###!!!":
                        full_response = ""
                    else:
                        full_response += line+"\n"
                        with open(reply_file_path, 'w') as reply_file:
                            if full_response[-1:] == "\n":
                                reply_file.write(full_response[:-1])
                            else:
                                reply_file.write(full_response)

            with open(reply_file_path, 'r') as read_reply:
                print("REPLY FILE CONTENT")
                print(read_reply.read())

            with open(query_file_path, 'w') as clear_file:
                clear_file.write("")

            time.sleep(1)

            with open(reply_file_path, 'w') as clear_file:
                clear_file.write("###InferenceComplete###")

            with open(history, 'r') as file:
                content = file.read()


def flask_app_runner():
    app.run(port=5555)


clear_files()

main_thread = threading.Thread(target=answer)
main_thread.start()
if __name__ == '__main__':

    flask_thread = threading.Thread(target=flask_app_runner)
    flask_thread.start()
