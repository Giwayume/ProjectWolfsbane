#pragma strict

var player : PlayerYvette;

function Start () {
	player = gameObject.GetComponentInParent(PlayerYvette);
}

function OnTriggerEnter2D(collider) {
	//player.grounded = true;
}

function OnTriggerStay2D(collider) {
	player.grounded = true;
	player.naturallyGrounded = true;
}

function OnTriggerExit2D(collider) {
	player.grounded = false;
	UngroundAfterTimeout();
}

function UngroundAfterTimeout() {
	yield WaitForSeconds(0.2);
	player.naturallyGrounded = false;
}