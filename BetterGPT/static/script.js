console.log("JS WORKING")
fetch('/write-file', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename: './history.json', data: "[]" }),
})
    .then((response) => {
        if (response.ok) {
            console.log('File written successfully.');
        } else {
            console.error('Error writing file:', response.statusText);
        }
    })
    .catch((error) => {
        console.error('Error writing file:', error);
    });

if (window.innerWidth < "1400") {
    document.querySelector('.sidebar').classList.add('sidebargo')
}

var queryContainer = document.querySelector('.query-container');

document.querySelector('#main-content').style.height = window.innerHeight + "px";
document.querySelector('body').style.height = window.innerHeight + "px";
document.querySelector('.hamburger').addEventListener("click", () => {
    document.querySelector('.sidebar').classList.toggle('sidebargo');
    document.querySelector('.hamburger').classList.toggle = 'cross';
    document.querySelector('.query-container').classList.toggle('querygo');
    if (queryContainer.classList.contains('querygo')) {
        setTimeout(function () {
            queryContainer.style.display = 'none';
        }, 200);
    } else {
        queryContainer.style.display = "flex";
    }
})

var sendButton = document.querySelector('.send-button');
var queryInput = document.querySelector('.query-input');

sendButton.disabled = true; // Disable the send button initially


var temperatureSlider = document.getElementById('temperature-slider');
var temperatureValue = document.getElementById('temperature-value');

var topPSlider = document.getElementById('top-p-slider');
var topPValue = document.getElementById('top-p-value');

var topKSlider = document.getElementById('top-k-slider');
var topKValue = document.getElementById('top-k-value');

var repeatPenaltySlider = document.getElementById('repeat-penalty-slider');
var repeatPenaltyValue = document.getElementById('repeat-penalty-value');

var maxTokensSlider = document.getElementById('max-tokens-slider');
var maxTokensValue = document.getElementById('max-tokens-value');

var maxHistorySlider = document.getElementById('max-history-slider');
var maxHistoryValue = document.getElementById('max-history-value');


temperatureSlider.addEventListener('input', function () {
    temperatureValue.textContent = temperatureSlider.value;
    writeParameters();
});

topPSlider.addEventListener('input', function () {
    topPValue.textContent = topPSlider.value;
    writeParameters();
});

topKSlider.addEventListener('input', function () {
    topKValue.textContent = topKSlider.value;
    writeParameters();
});

repeatPenaltySlider.addEventListener('input', function () {
    repeatPenaltyValue.textContent = repeatPenaltySlider.value;
    writeParameters();
});

maxTokensSlider.addEventListener('input', function () {
    maxTokensValue.textContent = maxTokensSlider.value;
    writeParameters();
});

maxHistorySlider.addEventListener('input', function () {
    maxHistoryValue.textContent = maxHistorySlider.value;
    writeParameters();
});

function writeParameters() {
    var parameters = temperatureSlider.value + "\n" + topPSlider.value + "\n" + topKSlider.value + "\n" + repeatPenaltySlider.value + "\n" + maxTokensSlider.value + "\n" + maxHistorySlider.value;

    fetch('/write-file', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: '/opt/render/project/src/parameters.txt', data: parameters }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Parameters written successfully.');
            } else {
                console.error('Error writing parameters:', response.statusText);
            }
        })
        .catch((error) => {
            console.error('Error writing parameters:', error);
        });
}

writeParameters();

window.addEventListener('load', function () {
    var loadingScreen = document.getElementById('loading-screen');
    var mainContent = document.getElementById('main-content');

    var centeredContent = document.getElementById('centered-content');
    var conversation = document.getElementById('conversation');
    var main = document.getElementById('main');

    function scrollConversationToBottom() {
        conversation.scrollTop = conversation.scrollHeight;
    }

    sendButton.disabled = true; // Disable the send button initially

    sendButton.addEventListener('click', function () {
        writeParameters();
        var conversationContainer = document.getElementById('conversation');

        // Get all message elements within the container
        var messageElements = conversationContainer.querySelectorAll('.message');

        // Create an array to store messages in pairs
        var messagePairs = [];

        // Iterate over each message element
        var messages = [];
        messageElements.forEach(function (message) {
            // Push the text content of each message to the messages array
            messages.push(message.textContent.trim());

            // Check if the current message is a reply (reply-text)
            if (message.classList.contains('reply-text')) {
                // Push the array of messages to the messagePairs array and reset the messages array
                messagePairs.push(messages);
                messages = [];
            }
        });

        // Display the result
        console.log(messagePairs);
        var messagePairsJSON = JSON.stringify(messagePairs);

        fetch('/write-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: './history.json', data: messagePairsJSON }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log('File written successfully.');
                } else {
                    console.error('Error writing file:', response.statusText);
                }
            })
            .catch((error) => {
                console.error('Error writing file:', error);
            });
        sendButton.disabled = true; // Disable the send button initially
        document.querySelector('.status-image').src = "https://i.pinimg.com/originals/3e/f0/e6/3ef0e69f3c889c1307330c36a501eb12.gif";
        // sendButton.style.padding = "0";
        document.querySelector('.send-button').style.opacity = "1";
        // document.querySelector('.status-image').style.height = "30px";


        var query = queryInput.value.trim();
        if (query !== '') {
            main.style.display = 'none';
            queryInput.value = "";
            queryInput.style.height = "20px";

            var sentText = document.createElement('pre');
            sentText.className = "sent-text";
            sentText.classList.add("message")
            sentText.style.padding = "20px";
            sentText.textContent = query;
            sentText.readOnly = true;
            conversation.append(sentText);

            fetch('/write-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: '/opt/render/project/src/query.txt', data: query }),
            })
                .then((response) => {
                    if (response.ok) {
                        console.log('File written successfully.');
                    } else {
                        console.error('Error writing file:', response.statusText);
                    }
                })
                .catch((error) => {
                    console.error('Error writing file:', error);
                });

            function LiveListen() {
                fetch('/reply.txt')
                    .then((res) => res.text())
                    .then((text) => {
                        if (text.trim() !== '###InferenceComplete###') {
                            console.log(text);
                            if (text.trim() !== '') {
                                updateReplyText(text); // Update the reply text element
                                scrollConversationToBottom(); // Scroll the conversation to the bottom
                            }
                            setTimeout(LiveListen, 200);
                        } else {
                            console.log("DONE");
                            finalizeReplyText(); // Finalize the reply text element
                        }
                    })
                    .catch((e) => console.error(e));
            }

            function updateReplyText(text) {
                const replyTextElement = document.getElementById('current-reply');
                if (replyTextElement) {
                    replyTextElement.textContent = text; // Append new text to the existing content
                } else {
                    const newReplyTextElement = document.createElement('pre');
                    newReplyTextElement.id = 'current-reply';
                    newReplyTextElement.className = 'reply-text';
                    newReplyTextElement.classList.add("message")
                    newReplyTextElement.style.padding = "20px";
                    newReplyTextElement.textContent = text;
                    conversation.appendChild(newReplyTextElement);
                    newReplyTextElement.classList.add("cursor-animation");
                    scrollConversationToBottom();
                }
            }

            function finalizeReplyText() {
                const replyTextElement = document.getElementById('current-reply');
                if (replyTextElement) {
                    replyTextElement.removeAttribute('id')
                    replyTextElement.classList.remove("cursor-animation");
                }
                sendButton.disabled = true;
                document.querySelector('.status-image').src = "./static/Send Icon.png";
                document.querySelector('.send-button').style.opacity = "0.3";

                if (queryInput.value.trim() !== '') {
                    document.querySelector('.send-button').style.opacity = "1";
                    sendButton.disabled = false; // Enable the send button if there is text
                } else {
                    document.querySelector('.send-button').style.opacity = "0.3";
                    sendButton.disabled = true; // Disable the send button if there is no text
                }
                scrollConversationToBottom();
            }

            function checkReplyFile() {
                fetch('/reply.txt')
                    .then((res) => res.text())
                    .then((text) => {
                        if (text.trim() !== '###InferenceComplete###') {
                            LiveListen();
                        } else {
                            console.log("WAITING");
                            setTimeout(checkReplyFile, 200);
                        }
                    })
                    .catch((e) => console.error(e));
            }

            checkReplyFile();
            centeredContent.style.justifyContent = "start";
            conversation.scrollTop = conversation.scrollHeight;
        }
    });

    queryInput.addEventListener('input', function () {
        if (queryInput.value.trim() !== '') {
            document.querySelector('.send-button').style.opacity = "1";
            sendButton.disabled = false; // Enable the send button if there is text
        } else {
            document.querySelector('.send-button').style.opacity = "0.3";
            sendButton.disabled = true; // Disable the send button if there is no text
        }

        this.style.height = "auto";
        if (this.scrollHeight > 30) {
            this.style.height = (this.scrollHeight > 30 ? this.scrollHeight - 10 : this.scrollHeight) + 'px';
        }
    });

    queryInput.addEventListener('keydown', function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendButton.click();
        }
    });


    setTimeout(function () {
        loadingScreen.style.opacity = '0';

        setTimeout(function () {
            loadingScreen.style.display = 'none';
            mainContent.style.display = 'flex';
        }, 1000);
    }, 2000);
});
