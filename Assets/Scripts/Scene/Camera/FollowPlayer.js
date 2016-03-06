#pragma strict

var position : Vector3;
var player : Transform;

function Start () {
	player = gameObject.GetComponentInParent(Player) as Transform;
}

function Update () {
	transform.position = player.position + position;
}