import { Component, OnInit, Query } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
  
export class HomeComponent implements OnInit {
roomName:string;//use this to delete room names
add:string;//add gets the inputs//ngModel [ngModelOptions]="{name:'username'}"
roomList = new Array<string>();//this list contains room names
logged: boolean = false;
temp:string="";
 updateRoom = gql`mutation updateRoom($currentRoom:String!,$recipient:String!,$sender:String!,$passphrase:String!) {
  updateBook(currentRoom:$currentRoom,recipient:$recipient,sender:$sender,passphrase:$passphrase) {
  _id
  }}`;
//if room doesn't exist add room and if room is choosen update currentRoom and make the rest empty 
 addRoom = gql`mutation addroom($currentRoom:String!,$recipient:String!,$sender:String!,$passphrase:String!) {
  addroom(currentRoom:$currentRoom,recipient:$recipient,sender:$sender,passphrase:$passphrase) {
    _id
  }}`;

  checkRoom = gql` {
    rooms{
     currentRoom
    }
  }`;
  
constructor(private router: Router,private route: ActivatedRoute,private apollo: Apollo) 
  {  
    //this.roomList.push(this.apollo.watchQuery({ query: this.checkRoom}).subscribe());
  } //add in the constructor an auto load option and add user name and servers in the server
   //rooms:roominfo = new roominfo();

  join():void{     
    for (var i = 0; i < this.roomList.length; i++) 
    {
     this.roomName=this.roomList[i];
     i+=1;
     //add the selected room
     //this.rooms.addRoom(this.roomName);
     }//this.router.navigate(["/chat"]);
     this.apollo.mutate({ mutation: this.updateRoom,
      variables: {
        currentRoom:this.roomName,recipient:this.temp,sender:this.temp,passphrase:this.temp
      }}).subscribe(({ data }) => {alert('Account is generated, you will be redirected to login '+this.roomName);
      },(error) => {alert('there was an error maybe the username already exists '+ error);});    
    }
  roomLists():string{
     for (var i = 0; i < this.roomList.length; i++) 
     {
      this.roomName=this.roomList[i];
      i+=1;
       return this.roomName;//list all rooms by looping through
      } 
    }

create():void{
  this.roomName=this.add;
  this.roomList.push(this.roomName);
  alert('Room created!'); 
  this.add='';//this.roomList.push(this.apollo.watchQuery({query:this.checkRoom}).toString());
  this.apollo.mutate({mutation: this.addRoom,
    variables: {
      currentRoom:this.roomName,recipient:this.temp,sender:this.temp,passphrase:this.temp
    }}).subscribe(({ data }) => {},(error) => {alert('there was an error sending the query '+ error);});    
}//this adds a room name to the list

delete():void{this.roomName=this.add;
   const index: number = this.roomList.indexOf(this.roomName);
   if (index > -1) {
     this.roomList.splice(index, 1);
     alert('Room deleted!');
    }//here delete room 
  }//this removes a room name to the list
  
  logout():void{this.apollo.getClient().resetStore();//
    this.router.navigate(["/login"]);//here update room name with empty
  }

  ngOnInit() {}
}