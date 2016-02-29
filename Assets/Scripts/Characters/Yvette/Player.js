#pragma strict

var body : Rigidbody2D;
var animator : Animator;

var speed : float;
var maxSpeed : float;
var jumping : boolean;
var jumpPower : float;
var jumpRemainingDistance : float;
var jumpMaxDistance : float;
var grounded : boolean;
var falling : boolean;

function Start () {
	body = gameObject.GetComponent("Rigidbody2D") as Rigidbody2D;
	animator = gameObject.GetComponent("Animator") as Animator;

	speed = 150;
	maxSpeed = 10;
	jumping = false;
	jumpPower = 20;
	jumpRemainingDistance = 0;
	jumpMaxDistance = 100;
	grounded = true;
}

function Update () {

	animator.SetBool("grounded", grounded);
	animator.SetBool("falling", falling);
	animator.SetFloat("speed", Mathf.Abs(body.velocity.x));

	// Flip sprite
	if (Input.GetButtonDown("Left")) {
		transform.localScale = new Vector3(-1, 1, 1);
	} else if (Input.GetButtonDown("Right")) {
		transform.localScale = new Vector3(1, 1, 1);
	}

	// Jump
	if (Input.GetButtonDown("Jump") && grounded) {
		jumping = true;
		jumpRemainingDistance = jumpMaxDistance;
	}
	if (Input.GetButtonUp("Jump") && jumping) {
		if (body.velocity.y > 10) {
			body.velocity = new Vector2(body.velocity.x, 10);
		}
		jumpRemainingDistance = 0;
	}

	// Exit game
	if (Input.GetKeyDown("escape")) {
		Application.Quit();
	}
}

function FixedUpdate() {

	falling = (body.velocity.y < 5 && !grounded) ? true : false;

	// Movement
	if (Input.GetButton("Right")) {
		body.velocity = new Vector2(maxSpeed, body.velocity.y);
	} else if (Input.GetButton("Left")) {
		body.velocity = new Vector2(-maxSpeed, body.velocity.y);
	} else {
		body.velocity = new Vector2(0, body.velocity.y);
	}

	// Jump
	if (Input.GetButton("Jump") && jumpRemainingDistance > 0) {
		body.velocity = new Vector2(body.velocity.x, jumpPower);
		jumpRemainingDistance -= jumpPower;
	}

}