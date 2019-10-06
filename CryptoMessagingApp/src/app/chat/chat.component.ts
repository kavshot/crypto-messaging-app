import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
//const client = require("@arkecosystem/client");
//const Client = new client("http://localhost:4003/api/v2");//the blockchain node it point to http://my.node.ip:port/api/v2

// you can find the source code for these here:// https://github.com/ArkEcosystem/core/tree/master/packages/crypto/src
const crypto = require("@arkecosystem/crypto"); //this allows for performing crypto operations.

//the application send to the recipient and take ark to sent to the user but it does not allow the library to be used
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})

//it sends the message based on the passphrase and recipient and sender
export class ChatComponent implements OnInit {
  roomName: string = "room"; //make a query that fetches the provided room
  recipientId: string = ""; //info from wallet to send or recieve message reipient is gonne be the room name
  SenderId: string = ""; //info from wallet to send or recieve message
  user: string = ""; //change this admin and room to a query that retrieves
  userList = new Array<string>(); //list of users
  messageText: string = ""; //the text recieved
  messageContainer: string; //temporary message container to store in array
  messageArray = new Array<string>(); //this array needs to send to the ark core blockchain but the api doesnt allow to be send over the ark
  message = this.messageText;
  passPhrase: string = ""; //is needed to send messages.also it is the password you use to sign your wallet
  signed = null;
  start:boolean=false;
  //this updates a room to the database
  updateRoom = gql`
    mutation updateRooms(
      $currentRoom: String!
      $recipient: String!
      $sender: String!
      $passphrase: String!
    ) {
      updateRooms(
        currentRoom: $currentRoom
        recipient: $recipient
        sender: $sender
        passphrase: $passphrase
      ) {
        currentRoom
      }
    }
  `;
  //this fetch a room to the database
  fetchRoom = gql`
    mutation fetchRoom(
      $currentRoom: String!
      $recipient: String!
      $sender: String!
      $passphrase: String!
    ) {
      fetchRoom(
        currentRoom: $currentRoom
        recipient: $recipient
        sender: $sender
        passphrase: $passphrase
      ) {
        currentRoom
      }
    }
  `;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apollo: Apollo
  ) {
    if(this.start==false) {//this allows to confirm the room name so it updates the correct room
      const adder=prompt("Confirm the selected room!","Enter room name"); 
      this.roomName=adder;
      this.start=true;
    }
    console.log(crypto); //look at the developer console output to inspect the contents of the crypto toolset
    //const k = crypto.Identities.Keys.fromPassphrase(this.passPhrase);//this key changes the passphrase of the wallet into a address finder
    const m = this.messageText; //the message that gets hashed to be send
    const hash = crypto.Crypto.HashAlgorithms.sha256(m); //the message gets hashed to be send to the chain

    // see https://github.com/ArkEcosystem/core/blob/master/packages/crypto/src/crypto/message.ts
    const signature = crypto.Crypto.Message.sign(hash, this.passPhrase); //the signature that gets the message and sends it
    this.signed = {
      //the signed information of a string message
      message: m, // not really needed
      hash, // not really needed
      signature
    };
    //client.setVersion(2);this makes the client run on version two of ark core for cusom ark blockchain
    this.recieveMessage();//this allows to recieve the message
  }

  home(): void {
    this.router.navigate(["/home"]);
    alert("leaving chat!");
  } //to go back to the page of the rooms
  //send message is correct check recieve,server and blockchain connection and wallet.
  async sendMessage() {
    //allows for sending message
    if (this.recipientId != "" && this.SenderId != "") {
      //recipient is reciever and the sender is where to send to
      if (this.user == "") {
        this.user = this.recipientId;
      }
      if (this.messageText != "") {
        this.messageContainer = this.messageText;
        this.messageArray.push(this.messageContainer);
        // see https://github.com/ArkEcosystem/core/blob/master/packages/crypto/src/crypto/message.ts
        let result = crypto.Crypto.Message.verify(this.signed.signature);//this verifies the message and allows to be send

        // inspect the result of the verification process, which will be a boolean (true/falsnpm i @angular/router -se)
        console.log(result);

        if (!result) {
          alert("Message is empty! result of process is " + result); // do something if result if false..
        }
        //this should fetch the data of the current situation and send
        this.apollo.mutate({
            //this updates the room information constantly when messaging!
            mutation: this.updateRoom,
            variables: {
              currentRoom: this.roomName,
              recipient: this.recipientId,
              sender: this.SenderId,
              passphrase: this.passPhrase
            }
          })
          .subscribe(
            ({ data }) => {
             // alert("information has been selected!" + data);
            },
            error => {
             // alert("there was an error when loging in " + error);
            }
          );

        this.messageText = "";
      } else {
        alert("Message is empty!");
      }
    } else {
      alert("enter recipient id and sender id of your wallet correctly!");
    }

  }
//the message need to be send and hashed  the blockchain and then unhashed from the blockchain and stored in a array.
 async recieveMessage(){ //the client to recieve message/transaction and change resource to api if needed
 try {const response = await crypto.resource("transactions").all({//Client was changed to Crypto due to error reasons
      senderId: this.SenderId,//this recieves message from wallet and takes sender from user
      orderBy: "timestamp.epoch"
});return this.messageContainer=response.data;//here its gonne push the message from the blockchain to the array
  //const responses = await crypto.api("node").status();
  //return responses.data;
  //this.messageContainer=response.data;
} catch (e) {console.log(e);
  this.messageArray.push(this.messageContainer);//push the message in the array to be displayed
}}/**///add transaction to the api pool

  confirm() {
    //allows to comfirm
    if (this.recipientId != "" && this.SenderId != "" && this.SenderId != "") {
      this.apollo .mutate({
          //updates the room user to send a message
          mutation: this.updateRoom,
          variables: {
            currentRoom: this.roomName,
            recipient: this.recipientId,
            sender: this.SenderId,
            passphrase: this.passPhrase
          }
        })
        .subscribe(
          ({ data }) => {
            alert("information has been selected!" /*+data*/);
          },
          error => {
            alert("there was an error when loging in " + error);
          }
        );
    } else {
      alert("Empty or incorect information!");
    }
  }
 
  ngOnInit() {}  
}