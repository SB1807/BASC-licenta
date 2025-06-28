#include <Servo.h>

Servo baseServo;
Servo shoulderServo;
Servo elbowServo;
Servo gripperServo;

#define GRIPPER_PIN 9
#define TRIG_PIN 10
#define ECHO_PIN 11

String inputString = "";
bool stringComplete = false;

void setup() {
  Serial.begin(9600);
  baseServo.attach(3);
  shoulderServo.attach(5);
  elbowServo.attach(6);
  gripperServo.attach(GRIPPER_PIN);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  inputString.reserve(50);
  Serial.println("Arduino READY");
}

void stopAllServos() {
  baseServo.detach();
  shoulderServo.detach();
  elbowServo.detach();
  gripperServo.detach();
  Serial.println("All servos stopped");
}

float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 25000);  // timeout at 25ms
  float distance = duration * 0.0343 / 2.0;
  return distance;
}

void loop() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }

  if (stringComplete) {
    inputString.trim();

    if (inputString == "STOP") {
      stopAllServos();
    }

    else if (inputString == "DISTANCE") {
      float dist = readDistance();
      Serial.println(dist);
    }

    else if (inputString.startsWith("MOVE:")) {
      // Format: MOVE:base,shoulder,elbow,gripper
      String coords = inputString.substring(5);
      coords.trim();

      int idx1 = coords.indexOf(',');
      int idx2 = coords.indexOf(',', idx1 + 1);
      int idx3 = coords.indexOf(',', idx2 + 1);

      int base = coords.substring(0, idx1).toInt();
      int shoulder = coords.substring(idx1 + 1, idx2).toInt();
      int elbow = coords.substring(idx2 + 1, idx3).toInt();
      int gripper = coords.substring(idx3 + 1).toInt();

      baseServo.attach(3);
      shoulderServo.attach(5);
      elbowServo.attach(6);
      gripperServo.attach(GRIPPER_PIN); 

      baseServo.write(base);
      shoulderServo.write(shoulder);
      elbowServo.write(elbow);
      gripperServo.write(gripper);  

      Serial.println("OK");
    }

    else if (inputString.startsWith("GRIP:")) {
      String command = inputString.substring(5);
      gripperServo.attach(GRIPPER_PIN);

      if (command == "close") {
        gripperServo.write(180); 
      } else if (command == "open") {
        gripperServo.write(0);   
      } else if (command == "stop") {
        gripperServo.write(90);  
      }

      Serial.println("OK");
    }

    inputString = "";
    stringComplete = false;
  }
}
