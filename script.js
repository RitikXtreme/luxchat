const SUPABASE_URL = "https://rxundroadkzdxzszqoai.supabase.co";
const SUPABASE_KEY = "sb_publishable_yRqIMmEfIvfyBbHS7oDJHw_w5ngE3Uk";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const username = document.getElementById("username");
const message = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");


async function loadMessages() {
    const { data, error } = await client
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.log(error);
        return;
    }

    chatBox.innerHTML = "";

    data.forEach(addMessage);

    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(msg) {
    const div = document.createElement("div");
    div.className = "message";

    div.innerHTML = `
        <strong>${msg.username}</strong>
        ${msg.message}
    `;

    chatBox.appendChild(div);
}

sendBtn.onclick = async () => {
    if(username.value.trim()==="" || message.value.trim()===""){
        alert("Enter your name and message");
        return;
    }

    const { error } = await client
        .from("messages")
        .insert({
            username: username.value,
            message: message.value
        });

    if(error){
        console.log(error);
        return;
    }

    message.value="";
};

const ding = document.getElementById("ding");
const notify = document.getElementById("notify");

let myName = "";

function showNotification(text){

    notify.textContent = "🔔 " + text;

    notify.classList.add("show");

    setTimeout(()=>{
        notify.classList.remove("show");
    },3000);

}

client
.channel("chat-room")
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"messages"
},
(payload)=>{

addMessage(payload.new);

chatBox.scrollTop=chatBox.scrollHeight;

if(
myName !== "" &&
payload.new.username !== myName
){

ding.play().catch(()=>{});

showNotification(
payload.new.username + " sent a message"
);

}

}
)
.subscribe();

loadMessages();
