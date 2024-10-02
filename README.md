![image](https://github.com/user-attachments/assets/e73856cf-04c1-4e97-a9c7-283d220c82d8)

![image](https://github.com/user-attachments/assets/bae8da2a-6aab-42db-9e1f-7aa3ed125647)


## io.on(event, callback):

io는 서버 전체를 관리하는 Socket.IO의 인스턴스입니다. <br/>
io.on()은 서버가 특정 이벤트를 수신할 때 실행할 콜백을 등록하는데, 주로 connection 이벤트를 처리하는 데 사용됩니다.  <br/>
connection 이벤트는 클라이언트가 서버에 연결될 때 발생하며, 연결된 각 클라이언트에 대해 새로운 socket 객체가 생성됩니다. 이 socket 객체를 통해 해당 클라이언트와 통신할 수 있습니다.  <br/>

 <br/> <br/>

## socket.on(event, callback):
socket은 각 클라이언트와의 연결을 나타냅니다.  <br/>
socket.on()은 특정 클라이언트에서 발생하는 이벤트를 수신할 때 실행할 콜백을 설정하는 데 사용됩니다. 이는 클라이언트 개별적으로 발생하는 이벤트(예: 메시지 전송, 방 입장)를 처리합니다. <br/>
