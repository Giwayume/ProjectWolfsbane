#pragma strict
import SimpleJSON;

public class AttackBehavior {
	public var attack1Neutral : String;
	public var attack1Up : String;
	public var attack1Crouch : String;
	public var attack1Air : String;
	public var attack1AirUp : String;
	public var attack1AirDown : String;
	public var attack2Neutral : String;
	public var attack2Up : String;
	public var attack2Crouch : String;
	public var attack2Air : String;
	public var attack2AirUp : String;
	public var attack2AirDown : String;
}

var body : Rigidbody2D;
var animator : Animator;

var speed : float;
var direction : float;
var maxSpeed : float;
var walking : boolean;
var jumping : boolean;
var jumpPower : float;
var jumpRemainingDistance : float;
var jumpMaxDistance : float;
var grounded : boolean;
var naturallyGrounded : boolean;
var hittingWall : boolean;
var falling : boolean;
var rolling : boolean;
var rollDirection : float;
var rollSpeed : float;
var backdashing : boolean;
var backdashSpeed : float;
var frozenTimeout : float;
var attacking : boolean;
var attackCanCombo : boolean;
var attackDelay : boolean;
var attackDefinition : JSONNode;
var attackBehavior : AttackBehavior;
var attackComboIndex : int;

function Start () {
	body = gameObject.GetComponent("Rigidbody2D") as Rigidbody2D;
	animator = gameObject.GetComponent("Animator") as Animator;

	speed = 150;
	direction = 1;
	maxSpeed = 10;
	walking = false;
	jumping = false;
	jumpPower = 20;
	jumpRemainingDistance = 0;
	jumpMaxDistance = 120;
	grounded = true;
	naturallyGrounded = true;
	hittingWall = false;
	falling = false;
	rolling = false;
	rollSpeed = 160;
	backdashSpeed = 200;
	attacking = false;
	attackCanCombo = false;
	attackDelay = false;
	attackDefinition = JSON.Parse((Resources.Load("Characters/Yvette/Attacks") as TextAsset).text);
	attackBehavior = new AttackBehavior();
	attackBehavior.attack1Neutral = attackBehavior.attack1Up = attackBehavior.attack1Crouch = "clawAttackBasicNeutral";
	attackComboIndex = 0;
}

function Update () {

	animator.SetBool("grounded", grounded);
	animator.SetBool("falling", falling);
	animator.SetBool("walking", walking);

	if ( (direction == -1 && body.velocity.x < 0) || (direction == 1 && body.velocity.x > 0)) {
		animator.SetFloat("speed", Mathf.Abs(body.velocity.x));
	} else {
		animator.SetFloat("speed", 0);
	}

	// Jump
	if (Input.GetButtonDown("Jump") && naturallyGrounded && !rolling && !backdashing && !attacking) {
		naturallyGrounded = false;
		jumping = true;
		jumpRemainingDistance = jumpMaxDistance;
	}
	if (Input.GetButtonUp("Jump") && jumping) {
		if (body.velocity.y > 10) {
			body.velocity = new Vector2(body.velocity.x, 10);
		}
		jumpRemainingDistance = 0;
	}

	// Roll
	if (Input.GetButtonDown("Roll") && grounded && !rolling && !backdashing && !attacking) {
		if (Input.GetButton("Left")) {
			RollStart(-1);
		} else if (Input.GetButton("Right")) {
			RollStart(1);
		} else {
			BackdashStart();
		}
	}

	// Claw Attack
	if (Input.GetButtonDown("Attack1") && !rolling && !backdashing) {
		ClawAttackStart();
	}

	// Exit game
	if (Input.GetKeyDown("escape")) {
		Application.Quit();
	}
}

function FixedUpdate() {

	falling = (body.velocity.y < 5 && !grounded) ? true : false;

	// Movement
	if (Input.GetButton("Left") && !Input.GetButton("Right") && !rolling && !backdashing && !attacking) {
		SetDirection(-1);
		body.velocity = new Vector2(-maxSpeed, body.velocity.y);
		walking = true;
	} else if (Input.GetButton("Right") && !Input.GetButton("Left") && !rolling && !backdashing && !attacking) {
		SetDirection(1);
		body.velocity = new Vector2(maxSpeed, body.velocity.y);
		walking = true;
	} else {
		if (!rolling && !backdashing && !attacking) {
			body.velocity = new Vector2(0, body.velocity.y);
		}
		walking = false;
	}

	// Jump (holding)
	if (Input.GetButton("Jump") && jumpRemainingDistance > 0) {
		body.velocity = new Vector2(body.velocity.x, jumpPower);
		jumpRemainingDistance -= jumpPower;
	}

	// Roll
	if (rolling) {
		body.velocity = new Vector2(rollDirection*(8+rollSpeed*(frozenTimeout*frozenTimeout)), body.velocity.y);
	}

	// Backdash
	if (backdashing) {
		body.velocity = new Vector2(-direction*(4+backdashSpeed*(frozenTimeout*frozenTimeout)), body.velocity.y);
	}

	// Fix slope sliding
	if (grounded) {
		var groundHit : RaycastHit2D = Physics2D.Raycast(transform.position, -Vector2.up, 3.0f, 1<<8);
		if (groundHit.collider != null && Mathf.Abs(groundHit.normal.x) > 0.1f && Mathf.Abs(groundHit.normal.x) < 0.5f) {
			Debug.Log(groundHit.normal);
			body.velocity = new Vector2(body.velocity.x - (groundHit.normal.x * 1), body.velocity.y);
			/*
			var pos : Vector3 = transform.position;
			pos.y += -groundHit.normal.x * Mathf.Abs(body.velocity.x) * Time.deltaTime * (body.velocity.x - groundHit.normal.x > 0 ? 1 : -1);
			transform.position = pos;
			*/

		}
	}
	if (hittingWall) {
		var wallHit = Physics2D.Raycast(new Vector3(transform.position.x, transform.position.y - 1.85, transform.position.z), new Vector2(direction, 0.0f), 3.0f, 1<<8);
		if (wallHit.collider != null && wallHit.normal.y < 0.5f) {
			body.velocity = new Vector2(0, body.velocity.y);
		}
	}

	// Subtract from frozen timeout
	frozenTimeout -= Time.deltaTime;

}

// Flips the sprite
function SetDirection(directionArgument : float) {
	direction = directionArgument;
	transform.localScale = new Vector3(direction, 1, 1);
}

// Roll
function RollStart(direction : float) {
	rolling = true;
	SetDirection(direction);
	rollDirection = direction;
	animator.SetTrigger("roll");
	StartCoroutine("RollWait", 0.35);
}
function RollWait(time : float) {
	frozenTimeout = time;
	yield WaitForSeconds(time);
	StartCoroutine("RollEnd");
}
function RollEnd() {
	rolling = false;
}

// Backdash
function BackdashStart() {
	backdashing = true;
	animator.SetTrigger("backdash");
	StartCoroutine("BackdashWait", 0.35);
}
function BackdashWait(time : float) {
	frozenTimeout = time;
	yield WaitForSeconds(time);
	StartCoroutine("BackdashEnd");
}
function BackdashEnd() {
	backdashing = false;
}

// Claw Attack
function ClawAttackStart() {
	if (grounded) {
		if (Input.GetButton("Up")) {
			AttackStart(attackDefinition[attackBehavior.attack1Up]);
		} else if (Input.GetButton("Down")) {
			AttackStart(attackDefinition[attackBehavior.attack1Crouch]);
		} else {
			AttackStart(attackDefinition[attackBehavior.attack1Neutral]);
		}
	} else {/*
		if (Input.GetButton("Up")) {
			AttackStart(attackDefinition[attackBehavior.attack1AirUp]);
		} else if (Input.GetButton("Down")) {
			AttackStart(attackDefinition[attackBehavior.attack1AirDown]);
		} else {
			AttackStart(attackDefinition[attackBehavior.attack1Air]);
		}
	*/}
}

// Magic Attack
function MagicAttackStart() {
	if (grounded) {
		if (Input.GetButton("Up")) {
			AttackStart(attackDefinition[attackBehavior.attack2Up]);
		} else if (Input.GetButton("Down")) {
			AttackStart(attackDefinition[attackBehavior.attack2Crouch]);
		} else {
			AttackStart(attackDefinition[attackBehavior.attack2Neutral]);
		}
	} else {
		if (Input.GetButton("Up")) {
			AttackStart(attackDefinition[attackBehavior.attack2AirUp]);
		} else if (Input.GetButton("Down")) {
			AttackStart(attackDefinition[attackBehavior.attack2AirDown]);
		} else {
			AttackStart(attackDefinition[attackBehavior.attack2Air]);
		}
	}
}

// Carry out an attack
function AttackStart(definition : JSONNode) {
	if (!attackDelay && (!attacking || attackCanCombo)) {
		walking = false;
		attacking = true;

		// Reset combo index
		if (attackComboIndex >= definition.Count) {
			attackComboIndex = 0;
		}

		// Get reference to current combo attack
		var attack = definition[attackComboIndex];

		// Set the trigger to start the player/effect animation
		animator.SetTrigger(attack["trigger"]["player"]);

		// Movement velocity for the attack
		for (var key : String in attack["movement"].keys) {
			AttackMovement(parseFloat(key), attack["movement"][key]["x"].AsFloat, attack["movement"][key]["y"].AsFloat);
		}

		// Allow for a combo to take place
		if (attack["nextCombo"]) {
			if (attack["nextCombo"]["delay"].ToString().length > 0) {
				AttackDelay(attack["nextCombo"]["delay"].AsFloat);
				attackComboIndex = 0;
			} else {
				AttackAllowCombo(attack["nextCombo"]["start"].AsFloat);
				AttackDisallowCombo(attack["nextCombo"]["end"].AsFloat);
				attackComboIndex++;
			}
		}

		// How long before the player can move after attacking
		StopCoroutine("AttackWait");
		StartCoroutine("AttackWait", attack["freeze"].AsFloat);
	}
}
function AttackMovement(time : float, x : float, y : float) {
	yield WaitForSeconds(time);
	body.velocity = new Vector2(direction * x, body.velocity.y + y);
}
function AttackAllowCombo(time : float) {
	yield WaitForSeconds(time);
	attackCanCombo = true;
}
function AttackDisallowCombo(time : float) {
	yield WaitForSeconds(time);
	attackCanCombo = false;
	attackComboIndex = 0;
}
function AttackDelay(time : float) {
	attackDelay = true;
	yield WaitForSeconds(time);
	attackDelay = false;
}
function AttackWait(time : float) {
	frozenTimeout = time;
	yield WaitForSeconds(time);
	StartCoroutine("AttackEnd");
}
function AttackEnd() {
	attacking = false;
}
