#pragma strict

var player : PlayerYvette;

function Start () {
	player = gameObject.GetComponentInParent(PlayerYvette);
}

function OnTriggerEnter2D(collider) {
	player.hittingWall = true;
}

function OnTriggerStay2D(collider) {
	player.hittingWall = true;
}

function OnTriggerExit2D(collider) {
	player.hittingWall = false;
}
