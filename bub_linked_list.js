//bub_linked_list.js - Implements a singly linked list data structure.
//Used to keep track of scenes.

function LinkedList(){  
  //Start an empty list, nothing at the head.
  this.head = null;
  this.length = 0;
}

//Internal Linked List node.
function Node(val) {
  this.value = val;
  this.next = null;
}

//Add an object to the linked list.
//val - object to be stored in the linked list
LinkedList.prototype.push = function(val){
  //new node
  var node = new Node(val);
  if(this.head == null){ //Linked list is empty
    //This node becomes the new head
    this.head = node;
  } else { //Linked list is not empty, add to start.
    //previous head gets pushed back one spot
    node.next = this.head;
    //node becomes the new head
    this.head = node;
  }
  //keep track of list size
  this.length++;
}

//Remove an object from the linked list.
//val - object to be removed from the linked list
LinkedList.prototype.remove = function(val){
  //Current node being examined. Start with the head of the linked list.
	var current = this.head;
  //Keep track of the node before current.
  var last = null;
  
  //Loop over all nodes in the linked list
  while(current != null){
    //Look for the given value
  	if(current.value == val){
      //Found a match. Reduce the length by 1.
  	  this.length--;
    	if(current == this.head){
        //If the found node is the head then the next node becomes the new head.
      	this.head = current.next;
      	return;
      }
      //Found node is not the head. Remove the node by bridging the node before
      //and after the found node.
      last.next = current.next;
    }
    last = current;
  	current = current.next;
  }
}

//Run a function for every item in the linked list.
//functionToRun - function reference. Node value is passed to functionToRun.
LinkedList.prototype.runFunction = function(functionToRun){
	var current = this.head;

  //Loop over all nodes in the linked list
  while(current != null){
    functionToRun(current.value);
  	current = current.next;
  }
}

/*
//Debugging function: dump the linked list to the console
var debugPrintLL = function(LL){
	var current = LL.head;
  console.log("LL Length: " + LL.length);
  while(current != null){
  	console.log(current.value);
    current = current.next;
  }
}
*/