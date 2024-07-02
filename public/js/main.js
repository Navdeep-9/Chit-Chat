const chatform = document.getElementById('chat-form')
const messageContainer = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

const {username , room } = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

const socket = io();

socket.emit('joinRoom',{username,room})


//get rooms and users

socket.on('roomUsers',({room,users})=>{
    OutputRoomName(room)
    OutputUserName(users)
})

socket.on('message',function(data){

    outputMessage(data)
    // console.log(username,room);

    //scroll message container

    messageContainer.scrollTop = messageContainer.scrollHeight
})


chatform.addEventListener("submit", function(e){
    e.preventDefault();


    const mssg = e.target.elements.msg.value;
    //fetch the id  of the input filed in the form 

    socket.emit('chatMessage' , mssg)


    // clear inputs

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


//output message to DOM

function outputMessage(data){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML =`<p class="meta">${data.username} <span>${data.time}</span></p>
    <span class="text">
       ${data.text}
    </span>`

    document.querySelector('.chat-messages').appendChild(div)
}

function OutputUserName(users){

    usersList.innerHTML = `
    ${users.map(user =>`<li> ${user.username}</li>`).join('')}`
}

function OutputRoomName(room){
    roomName.innerText = room;

}

