// Declare all variables for elements at the top
const examples = document.querySelector(".examples");
const description = document.querySelector(".description");
const pagetitle = document.querySelector(".pagetitle");
const querycontainer = document.querySelector(".query-container");
const queryinput = document.querySelector(".query-input");
const chats = document.querySelector(".chats");
const newchat = document.querySelector(".newchat");
const privatechat = document.querySelector(".privatechat");
const logo = document.querySelector(".logo");
const tools = document.querySelector(".tools");
const newChatButton = document.querySelector('.newchat');
const introDiv = document.querySelector('.intro');
const conversation = document.querySelector('.conversation');
const sendButton = document.querySelector('.send-button');
const sendContainer = document.querySelector('.send-container');
const statusimage = document.querySelector('.status-image');
const sidebar = document.querySelector('.sidebar');
const mainbody = document.querySelector('.mainbody');

let blinkingRectangle;
let rotationInterval;
let sidebargo = false;

const baseUrl = 'http://127.0.0.1:7777';
let chat_version = 0;

let all_chat_data = [];

let chatName = "";
let chatId = "";


let userId = "adolphhytler";
const chat_url = `${baseUrl}/getchats`;

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
}

function addChat(chatName) {
    const selectChatElement = document.querySelector('.selectchat');
    selectChatElement.insertAdjacentHTML('afterbegin', `
        <li class="fade-in">
            <div class="chat-info">
                <p class="chatname fade-in-text">${chatName}</p>
                <p class="time">0m</p>
            </div>
            <img src="img/3dot.png" alt="3 dots">
        </li>
    `);
    selectChatElement.querySelector('.fade-in-text').classList.add('animate');
    selectChatElement.querySelector('.fade-in').classList.add('animate');
    const messageElements = document.querySelectorAll('.message-container');
    const secondToLast = messageElements[messageElements.length - 2]?.querySelector('span')?.textContent || '';
    const last = messageElements[messageElements.length - 1]?.querySelector('p')?.textContent || '';

    all_chat_data.unshift({
        "chatId": chatId,
        "chatName": chatName,
        "history": [[secondToLast, last]],
        "lastmodified": new Date().toISOString(),
        "version": "0"
    });
}

function reorderChats() {
    const uniqueChats = all_chat_data.filter((chat, index, self) =>
        self.findIndex((t) => t.chatId === chat.chatId) === index
    );

    const sortedChats = uniqueChats.sort((a, b) => {
        const dateA = new Date(a.lastmodified);
        const dateB = new Date(b.lastmodified);
        return dateB - dateA;
    });

    all_chat_data = sortedChats;

    const htmlListItems = sortedChats.map(chat => {
        const timeDiff = getRelativeTime(chat.lastmodified);
        return `
        <li>
            <div class="chat-info">
                <p class="chatname">${chat.chatName}</p>
                <p class="time">${timeDiff}</p>
            </div>
            <img src="img/3dot.png" alt="3 dots">
        </li>
    `;
    });
    const selectChatElement = document.querySelector('.selectchat');
    selectChatElement.innerHTML = htmlListItems.join('');
}


function appendToHistory(param1, param2) {

}


function fetchAndDisplayChats() {
    fetch(chat_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
    })
        .then(response => response.json())
        .then(data => {
            const uniqueChats = data.chats.filter((chat, index, self) =>
                self.findIndex((t) => t.chatId === chat.chatId) === index
            );

            const sortedChats = uniqueChats.sort((a, b) => {
                const dateA = new Date(a.lastmodified);
                const dateB = new Date(b.lastmodified);
                return dateB - dateA;
            });

            all_chat_data = sortedChats;

            const htmlListItems = sortedChats.map(chat => {
                const timeDiff = getRelativeTime(chat.lastmodified);
                return `
                <li>
                    <div class="chat-info">
                        <p class="chatname">${chat.chatName}</p>
                        <p class="time">${timeDiff}</p>
                    </div>
                    <img src="img/3dot.png" alt="3 dots">
                </li>
            `;
            });
            const selectChatElement = document.querySelector('.selectchat');
            selectChatElement.innerHTML = htmlListItems.join('');
        });
}

fetchAndDisplayChats();


// Add click event listener to the chat list
document.querySelector('.selectchat').addEventListener('click', function (e) {
    console.log(all_chat_data)
    const clickedChat = e.target.closest('li');
    if (clickedChat) {
        const chatIndex = Array.from(clickedChat.parentNode.children).indexOf(clickedChat);
        console.log('Chat Index:', chatIndex);
        if (chatIndex !== -1 && all_chat_data[chatIndex]) {
            const chatHistory = all_chat_data[chatIndex].history || [];
            chatId = all_chat_data[chatIndex].chatId;
            chatName = all_chat_data[chatIndex].chatName;
            loadChat();
            console.log('Chat History:', chatHistory);

            const messageElements = document.querySelectorAll('.message-container');
            messageElements.forEach(element => element.remove());

            chatHistory.forEach(([user, bot]) => {
                addUserMessage(user);
                addBotMessage(bot);
            });

            setTimeout(scrollToBottom, 0);

        }
    }
});


hljs.highlightAll();

function setpagetitle() {
    const absoluteElement = document.querySelector(".pagetitle");
    const centeredElement = document.querySelector(".description");

    const centeredElementOffsetTop = centeredElement.offsetTop;
    const absoluteElementY = centeredElementOffsetTop - absoluteElement.offsetHeight;

    absoluteElement.style.top = `${absoluteElementY}px`;
}

setpagetitle();

const dropArea = document.getElementById('drop-area');
const uploadedFilesContainer = document.querySelector('.uploaded-files');
let uploadedFiles = []; // Array to hold all uploaded files
let dragCounter = 0; // Keep track of the drag event depth

// Show the drop area when dragging over the window
mainbody.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('active');
});

// Increment the drag counter when a drag event enters any element
mainbody.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    dropArea.classList.add('active');
});

// Decrement the drag counter when leaving an element
mainbody.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
        dropArea.classList.remove('active');
    }
});

// Handle dropping files
mainbody.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('active');
    dragCounter = 0; // Reset the counter after drop
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Add click event listener to .attachment element
const attachmentButton = document.querySelector('.attachment');
attachmentButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.click();

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
        document.body.removeChild(fileInput);
    });
});
// Handle the files and preview them
function handleFiles(files) {
    Array.from(files).forEach(file => {
        uploadedFiles.push(file); // Add file to the array
        displayFile(file);
    });
}

// Display each file with a preview and "X" to remove it
function displayFile(file) {
    const filePreview = document.createElement('div');
    filePreview.classList.add('file-preview');

    const fileDetails = document.createElement('div');
    fileDetails.classList.add('file-details');
    fileDetails.innerHTML = `<p>${file.name}</p><p class="filetype">${file.name.split('.').pop().toUpperCase()}</p>`;

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '<img src="img/x.png" class="closebutton" alt="Remove">';
    removeButton.classList.add('remove-file');
    removeButton.addEventListener('click', () => removeFile(file, filePreview));
    filePreview.appendChild(removeButton);

    if (file.type.startsWith('image/')) {
        const image = document.createElement('img');
        image.src = URL.createObjectURL(file);
        image.alt = "File Preview";
        image.style.height = '50px';
        image.style.width = 'auto';
        filePreview.appendChild(image);
        filePreview.style.width = 'auto';
        filePreview.style.height = '100%';
        filePreview.style.padding = '0';
        removeButton.style.top = '1px';
        removeButton.style.right = '1px';

        // Add click event to expand the image
        image.addEventListener('click', () => {
            openImageFullScreen(image.src);
        });
    } else {
        const icon = document.createElement('img');
        icon.src = "./img/examples/documents.png"
        icon.alt = "File Icon";
        icon.classList.add('uploaded-file-icon');
        removeButton.style.top = '5px';
        removeButton.style.right = '5px';
        removeButton.style.padding = '2px 5px';
        filePreview.appendChild(icon);
        filePreview.appendChild(fileDetails);
    }

    uploadedFilesContainer.appendChild(filePreview);
}

// Function to display the image in full screen
function openImageFullScreen(imageSrc) {
    // Create an overlay for the full-screen image
    const overlay = document.createElement('div');
    overlay.classList.add('image-overlay');

    // Create the full-screen image
    const fullScreenImage = document.createElement('img');
    fullScreenImage.src = imageSrc;
    fullScreenImage.classList.add('full-screen-image');
    overlay.appendChild(fullScreenImage);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '<img src="img/x.png" class="closebutton" alt="Remove">';
    closeButton.classList.add('close-fullscreen');
    overlay.appendChild(closeButton);

    // Append the overlay to the body
    document.body.appendChild(overlay);

    // Event listener to close the full-screen view when clicking on the overlay
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target === closeButton) {
            document.body.removeChild(overlay);
        }
    });
}


// Remove a file from the uploaded files array and from the DOM
function removeFile(file, filePreviewElement) {
    uploadedFiles = uploadedFiles.filter(f => f !== file);
    filePreviewElement.remove();
}


let titles = ['Write an essay', 'Generate an Image', 'Research and Find', 'Analyze this picture', 'Navigate my files'];
let descriptions = ['about the effects of global warming, include 3 causes and how it can be prevented', 'of an old civilization depicting the initial stage of human evolution', 'the events that led up to the American Revolution and cite the sources in MLA format', 'and follow the instructions in assignment.docx to create a summary of the key points', 'and find the presentation.pptx to submit on Canvas'];
let images = ['img/examples/writing.png', './img/examples/images.png', './img/examples/browser.png', './img/examples/documents.png', './img/examples/computer.webp'];

let inConvo = false;
const turndownService = new TurndownService();

// Function to assign random descriptions, titles, and images
function assignDescriptions() {
    // Make copies of the original arrays to avoid modifying them
    let availableDescriptions = [...descriptions];
    let availableTitles = [...titles];
    let availableImages = [...images];

    // Get all .ex-des elements, .exname elements, and .example img elements
    const desElements = document.querySelectorAll('.exdes');
    const titleElements = document.querySelectorAll('.exname');
    const imageElements = document.querySelectorAll('.example > img');

    // Loop through each element
    desElements.forEach((desElement, index) => {
        if (availableDescriptions.length > 0) {
            // Randomly select a description, title, and image from the list
            const randomIndex = Math.floor(Math.random() * availableDescriptions.length);
            const randomDescription = availableDescriptions[randomIndex];
            const randomTitle = availableTitles[randomIndex];
            const randomImage = availableImages[randomIndex];

            // Assign the description, title, and image to the elements
            desElement.textContent = randomDescription;
            titleElements[index].textContent = randomTitle;
            imageElements[index].src = randomImage;

            // Remove the selected description, title, and image from the copied lists
            availableDescriptions.splice(randomIndex, 1);
            availableTitles.splice(randomIndex, 1);
            availableImages.splice(randomIndex, 1);
        }
    });
}

document.querySelector('.logo img').addEventListener('click', function () {
    sidebargo = !sidebargo;
    if (sidebargo) {
        sidebar.style.width = '4vw';
        this.style.transition = 'transform 0.5s ease, background-color 0.3s ease';
        this.style.transform = 'rotate(180deg)';
        mainbody.style.width = '96vw';
    } else {
        sidebar.style.width = '17vw';
        this.style.transition = 'transform 0.5s ease, background-color 0.3s ease';
        this.style.transform = 'rotate(0deg)';
        mainbody.style.width = '83vw';
    }

})


document.addEventListener("DOMContentLoaded", function () {
    assignDescriptions();

    queryinput.focus();

    setTimeout(() => {
        examples.classList.add("show");
        description.classList.add("show");
        pagetitle.classList.add("show");
        querycontainer.classList.add("show");
        chats.classList.add("show");
        newchat.classList.add("show");
        privatechat.classList.add("show");
        logo.classList.add("show");
        tools.classList.add("show");
    }, 100); // slight delay to ensure everything is loaded
});

function gohome() {
    chatId = "";
    chatName = "";

    conversation.innerHTML = `
<div class="intro">
    <p class="description">Ya'll welcome to BetterGPT, powered by CRYSTAL! Upload pics, docs, videos, code;
        generate pics, docs, videos, code; get access to realtime info. ChatGPT won't do half this stuff for
        free. Sorry if there are bugs - I'm the only guy maintaining this thing on my broke-ass home
        computer. I'm working on scaling it up, but it's a slow process. If you find any issues, hit me up
        on Snap we're all homies here.</p>

    <div class="examples">

        <div class="example gradient">
            <p class="exname">Example 1</p>
            <p class="exdes">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, temporibus.</p>
            <img src="" alt="" class="icon">
        </div>
        <div class="example gradient">
            <p class="exname">Example 2</p>
            <p class="exdes">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, temporibus.</p>
            <img src="" alt="" class="icon">
        </div>
        <div class="example gradient">
            <p class="exname">Example 3</p>
            <p class="exdes">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Esse, temporibus.</p>
            <img src="" alt="" class="icon" style="filter: tint(red);">
        </div>
    </div>
</div>
    `;
    fetchAndDisplayChats();
}

// Add event listener to the newchat button

newChatButton.addEventListener('click', async () => {
    // history.pushState({}, '', '/bettergpt.html');

    gohome();
    assignDescriptions();
    setpagetitle();

    conversation.style.marginTop = "0";
    conversation.style.height = "min-content";
    conversation.style.paddingBottom = "0";
    conversation.style.overflowY = "hidden";
    // Show intro div
    introDiv.style.display = 'flex';

    // Reset and show all starting animations
    const elementsToShow = [
        document.querySelector('.examples'),
        document.querySelector('.description'),
        document.querySelector(".pagetitle"),
    ];


    elementsToShow.forEach(element => {
        element.classList.remove('hide');
        element.classList.remove('private');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('show');
    });

    pagetitle.innerHTML = "<p>BetterGPT</p>";


    setTimeout(() => {
        document.querySelectorAll('.gradient').forEach(function (element) {
            element.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.style.setProperty('--mouse-x', `${x}px`);
                this.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }, 0);

    inConvo = false;
    document.querySelector('.query-input').focus();
});

privatechat.addEventListener('click', async () => {
    // history.pushState({}, '', '/bettergpt.html');

    gohome();
    assignDescriptions();
    setpagetitle();

    conversation.style.marginTop = "0";
    conversation.style.height = "min-content";
    conversation.style.paddingBottom = "0";
    conversation.style.overflowY = "hidden";

    pagetitle.innerHTML = "<p>PrivateGPT</p>";
    description.textContent = "Welcome to CRYSTAL private chat! Here, all of your chat will remain private and not be stored anywhere (not like it was stored on the server anyway)";
    // Show intro div
    introDiv.style.display = 'flex';

    // Reset and show all starting animations
    const elementsToShow = [
        document.querySelector('.examples'),
        document.querySelector('.description'),
        document.querySelector(".pagetitle"),
    ];


    elementsToShow.forEach(element => {
        element.classList.remove('hide');
        element.classList.remove('private');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('show');
    });


    setTimeout(() => {
        document.querySelectorAll('.gradient').forEach(function (element) {
            element.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.style.setProperty('--mouse-x', `${x}px`);
                this.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }, 0);
    inConvo = false;
    document.querySelector('.query-input').focus();
});


document.querySelectorAll('.selectchat li').forEach(chatItem => {
    chatItem.addEventListener('mouseover', () => {
        const image = chatItem.querySelector('img')
        if (image) {
            image.style.opacity = '1'
        }
    })

    chatItem.addEventListener('mouseout', () => {
        const image = chatItem.querySelector('img')
        if (image) {
            image.style.opacity = '0'; // Reset to default opacity
        }
    })
})

let shouldscroll = true;
let hello = 1;
// Function to scroll to the bottom of the chat container
function scrollToBottom() {
    conversation.scrollTop = conversation.scrollHeight;
}

let scrollTimeout;
let lastScrollTop = 0;
conversation.addEventListener('scroll', () => {
    const scrollTop = conversation.scrollTop;
    const isNearBottom = conversation.scrollHeight - conversation.clientHeight <= conversation.scrollTop + 100;
    if (scrollTop < lastScrollTop) {
        shouldscroll = false;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            hello = 1;
        }, 150);
    } else if (isNearBottom) {
        shouldscroll = true;
    }
    lastScrollTop = scrollTop;
});

document.querySelectorAll('.gradient').forEach(function (element) {
    element.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.style.setProperty('--mouse-x', `${x}px`);
        this.style.setProperty('--mouse-y', `${y}px`);
    });
});

let processing = false;
let abortController;

queryinput.addEventListener('input', function () {
    if (queryinput.value.trim() !== '') {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }

    this.style.height = "auto";
    if (this.scrollHeight > 30) {
        this.style.height = (this.scrollHeight > 30 ? this.scrollHeight - 10 : this.scrollHeight) + 'px';
        // sendContainer.style.height = "100%";
    } else {
        sendContainer.style.height = "auto";
    }
});

queryinput.addEventListener('keydown', function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendButton.click();
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function finalizeReply(query, botresponse) {
    processing = false;
    console.log("Stream stopped");
    sendButton.classList.remove('stop-button');
    sendButton.classList.add('send-button');
    statusimage.src = "img/Send Icon.png";
    statusimage.style.transform = `rotate(0deg)`;
    if (blinkingRectangle) {
        blinkingRectangle.remove();
    }
    clearInterval(rotationInterval);
    sendButton.disabled = true;

    if (shouldscroll) {
        scrollToBottom();
    }

    const mostRecentVersion = all_chat_data
        .filter(chat => chat.chatId === chatId)
        .reduce((latest, current) => {
            const latestDate = new Date(latest.lastmodified);
            const currentDate = new Date(current.lastmodified);
            return currentDate > latestDate ? current : latest;
        });

    const currentChatHistory = mostRecentVersion.history;
    currentChatHistory.push([query, botresponse]);

    const chatIndex = all_chat_data.findIndex(chat => chat.chatId === chatId);
    if (chatIndex !== -1) {
        all_chat_data[chatIndex].history = currentChatHistory;
    }

    const uniqueChats = all_chat_data.filter((chat, index, self) =>
        self.findIndex((t) => t.chatId === chat.chatId) === index
    );

    const sortedChats = uniqueChats.sort((a, b) => {
        const dateA = new Date(a.lastmodified);
        const dateB = new Date(b.lastmodified);
        return dateB - dateA;
    });

    const htmlListItems = sortedChats.map(chat => {
        const timeDiff = getRelativeTime(chat.lastmodified);
        return `
            <li>
                <div class="chat-info">
                    <p class="chatname">${chat.chatName}</p>
                    <p class="time">${timeDiff}</p>
                </div>
                <img src="img/3dot.png" alt="3 dots">
            </li>
        `;
    });
    const selectChatElement = document.querySelector('.selectchat');
    selectChatElement.innerHTML = htmlListItems.join('');
}

async function loadChat() {
    const examplesContainer = document.querySelector('.examples');
    const description = document.querySelector(".description");

    pagetitle.style.top = "-45px";
    pagetitle.style.top = "-45px";
    examplesContainer.style.height = "0%";
    description.classList.remove("show");
    description.classList.add("hide");
    pagetitle.classList.remove("show");
    pagetitle.classList.add("hide");

    const examples = document.querySelectorAll('.example');
    const introDiv = document.querySelector('.intro');
    introDiv.style.display = "none";
    await delay(500);

    setTimeout(() => {
        examples.forEach(example => {
            example.classList.add("hide");
        });
    }, 500);

}

function addUserMessage(message) {
    const userMessageDiv = document.createElement("div");
    userMessageDiv.classList.add("message-container");
    const userImage = document.createElement("img");
    userImage.src = "img/pfpcool.png"; // Replace with the actual path to the user avatar image
    userImage.alt = "User:";
    userImage.classList.add("avatar");

    const messageContentDiv = document.createElement("div");
    messageContentDiv.classList.add("message", "user");

    const querySpan = document.createElement("span");
    querySpan.classList.add("query-text");
    querySpan.textContent = message;

    messageContentDiv.appendChild(querySpan);
    userMessageDiv.appendChild(userImage);
    userMessageDiv.appendChild(messageContentDiv);

    conversation.appendChild(userMessageDiv);

    conversation.style.marginTop = "70px";
    conversation.style.height = "88vh";
    conversation.style.paddingBottom = "5%";
    conversation.style.overflowY = "scroll";
}

function addBotMessage(message) {
    const botMessageDiv = document.createElement("div");
    botMessageDiv.classList.add("message-container");

    const botImage = document.createElement("img");
    botImage.src = "img/CRYSTAL Logo.png"; // Replace with actual path
    botImage.alt = "CRYSTAL:";
    botImage.classList.add("avatar", "botavatar");

    const botMessageContentDiv = document.createElement("div");
    botMessageContentDiv.classList.add("message", "bot");

    const textSpan = document.createElement("span");
    textSpan.innerHTML = marked.parse(message);
    textSpan.classList.add("bot-text");

    botMessageContentDiv.appendChild(textSpan);
    botMessageDiv.appendChild(botImage);
    botMessageDiv.appendChild(botMessageContentDiv);

    conversation.appendChild(botMessageDiv);
}

sendButton.addEventListener('click', async (event) => {
    let add_chat = false;
    let check_chatId = true;
    event.preventDefault(); // Prevent default form submission behavior
    console.log(uploadedFiles);
    let formData = new FormData();
    if (uploadedFiles.length > 0) {
        console.log("Sending files");
        uploadedFiles.forEach(file => {
            formData.append('files[]', file); // Append each file to the formData
        });
    } else {
        console.log("No Files Found");
    }

    const examplesContainer = document.querySelector('.examples');
    const description = document.querySelector(".description");

    pagetitle.style.top = "-45px";


    if (!processing) {
        examplesContainer.style.height = "0%";
        description.classList.remove("show");
        description.classList.add("hide");
        pagetitle.classList.remove("show");
        pagetitle.classList.add("hide");

        processing = true;

        const query = queryinput.value.trim();
        queryinput.value = "";
        queryinput.style.height = "auto";
        querycontainer.style.height = "auto";

        sendButton.classList.remove('send-button');
        sendButton.classList.add('stop-button');

        let rotationAngle = 0;
        statusimage.src = "img/square.jpeg";

        function rotateImage() {
            rotationAngle += 90;
            statusimage.style.transform = `rotate(${rotationAngle}deg)`;
        }
        rotationInterval = setInterval(rotateImage, 1000);

        loadChat();
        addUserMessage(query);

        const url = `${baseUrl}/crystal`;

        abortController = new AbortController();

        scrollToBottom();


        formData.append('query', query);
        formData.append('userId', userId);
        formData.append('chatId', chatId);
        formData.append('version', chat_version);
        formData.append('index', "0");

        let fetchOptions = {
            method: 'POST',
            body: formData,
            signal: abortController.signal,
        };

        console.log("Sending Request...");

        fetch(url, fetchOptions)
            .then(response => {
                const reader = response.body.getReader();
                let first_run = true;
                let textSpan;
                let full_response = "";
                let buffer = ''; // Buffer to accumulate incomplete chunks
                const decoder = new TextDecoder("utf-8");

                function readStream({ done, value }) {
                    if (done || !processing) {
                        finalizeReply(query, full_response);
                        return;
                    }

                    // Decode the chunk into a string
                    const chunk = decoder.decode(value, { stream: true });

                    // Add the chunk to the buffer
                    buffer += chunk;

                    // Split the buffer by newline to get complete JSON objects
                    const parts = buffer.split('\n');

                    // Loop through all but the last part (which might be incomplete)
                    for (let i = 0; i < parts.length - 1; i++) {
                        try {
                            // Try to parse the JSON chunk
                            const jsonChunk = JSON.parse(parts[i]);
                            const responseChunk = jsonChunk.response;
                            chatName = jsonChunk.chatName;
                            chatId = jsonChunk.chatId;

                            if (chatId === "" && check_chatId) {
                                console.log("New Chat Detected")
                                check_chatId = false;
                                add_chat = true;
                            }
                            if (add_chat && chatName !== "") {
                                console.log("Response completed, adding...")
                                addChat(chatName);
                                add_chat = false;
                            }

                            // Append response to the full response
                            full_response += responseChunk;

                            // Update the message display
                            if (first_run) {
                                const botMessageDiv = document.createElement("div");
                                botMessageDiv.classList.add("message-container");

                                const botImage = document.createElement("img");
                                botImage.src = "img/CRYSTAL Logo.png"; // Replace with actual path
                                botImage.alt = "CRYSTAL:";
                                botImage.classList.add("avatar", "botavatar");

                                const botMessageContentDiv = document.createElement("div");
                                botMessageContentDiv.classList.add("message", "bot");

                                textSpan = document.createElement("span");
                                textSpan.classList.add("bot-text");

                                blinkingRectangle = document.createElement("div");
                                blinkingRectangle.classList.add("blinking-rectangle");

                                // Add the text span and blinking rectangle to the message div
                                botMessageContentDiv.appendChild(textSpan);
                                botMessageContentDiv.appendChild(blinkingRectangle);
                                botMessageDiv.appendChild(botImage);
                                botMessageDiv.appendChild(botMessageContentDiv);

                                conversation.appendChild(botMessageDiv);

                                first_run = false;
                            }

                            // Update the bot message with new content
                            const htmlContent = marked.parse(full_response);
                            textSpan.innerHTML = htmlContent;

                            if (shouldscroll) {
                                scrollToBottom();
                            }

                        } catch (error) {
                            console.error('Failed to parse JSON chunk:', parts[i], error);
                        }
                    }

                    // The last part of `parts` may be incomplete, so we keep it in the buffer
                    buffer = parts[parts.length - 1];

                    // Read the next chunk
                    reader.read().then(readStream);
                }

                reader.read().then(readStream);
            })
            .catch(error => {
                console.error("Error in streaming request:", error);

                // Handle errors and display them in the chat
                const botMessageDiv = document.createElement("div");
                botMessageDiv.classList.add("message-container");

                const botImage = document.createElement("img");
                botImage.src = "img/CRYSTAL Logo.png"; // Replace with actual path
                botImage.alt = "CRYSTAL:";
                botImage.classList.add("avatar", "botavatar");

                const botMessageContentDiv = document.createElement("div");
                botMessageContentDiv.classList.add("message", "bot");

                const textSpan = document.createElement("span");
                textSpan.textContent = "Error connecting to server: " + error.message;
                textSpan.classList.add("bot-text", "error");

                const blinkingRectangle = document.createElement("div");
                blinkingRectangle.classList.add("blinking-rectangle");

                botMessageContentDiv.appendChild(textSpan);
                botMessageContentDiv.appendChild(blinkingRectangle);
                botMessageDiv.appendChild(botImage);
                botMessageDiv.appendChild(botMessageContentDiv);

                conversation.appendChild(botMessageDiv);
                finalizeReply(query, "Error connecting to server: " + error.message);
            });
    } else {
        finalizeReply(query, full_response);
        abortController.abort();
    }
});

function highlightAndAddCopyButton(block) {
    const container = document.createElement('div');
    container.className = 'code-container';

    const bar = document.createElement('div');
    bar.className = 'code-bar';
    bar.style.display = 'flex';

    const languageTextbox = document.createElement('div');
    languageTextbox.className = 'langindicator';
    languageTextbox.style.marginRight = 'auto';

    const updateLanguageTextbox = () => {
        const languageClass = Array.from(block.classList).find(cls => cls.startsWith('language-'));
        if (languageClass) {
            const language = languageClass.replace('language-', '');
            languageTextbox.textContent = language;
        } else {
            languageTextbox.textContent = 'unknown';
        }
    };

    updateLanguageTextbox();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                updateLanguageTextbox();
            }
        });
    });

    observer.observe(block, { attributes: true, attributeFilter: ['class'] });

    bar.appendChild(languageTextbox);


    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.className = 'copy-button';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(block.textContent);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    };

    bar.appendChild(copyButton);

    block.parentNode.insertBefore(container, block);
    container.appendChild(bar);
    container.appendChild(block);

    hljs.highlightBlock(block);
}

// Call this function whenever a new code block is created
function processNewCodeBlocks() {
    document.querySelectorAll('pre > code:not(.processed)').forEach((block) => {
        highlightAndAddCopyButton(block);
        block.classList.add('processed');
    });
}

// Initial call to process existing code blocks
processNewCodeBlocks();

// Set up a MutationObserver to watch for new code blocks
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            processNewCodeBlocks();
            processBotResponseParagraphs();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

function processBotResponseParagraphs() {
    document.querySelectorAll('.bot-text p').forEach((paragraph) => {
        if (paragraph.innerHTML.trim().startsWith('<strong>') && paragraph.innerHTML.trim().endsWith('</strong>')) {
            paragraph.style.fontSize = '1.3em';
            paragraph.style.margin = "10px 0";
        }
    });
}

// Initial call to process existing paragraphs
processBotResponseParagraphs();
