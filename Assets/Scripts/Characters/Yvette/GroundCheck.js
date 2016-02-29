#pragma strict

var player : Player;

function Start () {
	player = gameObject.GetComponentInParent(Player);
}

function OnTriggerEnter2D(collider) {
	player.grounded = true;
}

function OnTriggerStay2D(collider) {
	player.grounded = true;
}

function OnTriggerExit2D(collider) {
	player.grounded = false;
}