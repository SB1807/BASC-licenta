import serial
import time

ser=serial.Serial("COM3", 9600, timeout=1)
time.sleep(2)

angles= "90,90,0,0\n"
ser.write(angles.encode())
print ("trimis:", angles)