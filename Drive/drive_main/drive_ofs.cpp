#include "drive_ofs.hpp"

int drive_ofs::convTwosComp(int b){
  //Convert from 2's complement
  if(b & 0x80){
    b = -1 * ((b ^ 0xff) + 1);
    }
  return b;
}

void drive_ofs::mousecam_reset(){
  digitalWrite(PIN_MOUSECAM_RESET,HIGH);
  delayMicroseconds(50); // reset pulse >10us
  digitalWrite(PIN_MOUSECAM_RESET,LOW);
  delayMicroseconds(3500); // 35ms from reset to functional
}

int drive_ofs::mousecam_init(){
  pinMode(PIN_MOUSECAM_RESET,OUTPUT);
  pinMode(PIN_MOUSECAM_CS,OUTPUT);
  
  digitalWrite(PIN_MOUSECAM_CS,HIGH);
  
  mousecam_reset();
  
  int pid = mousecam_read_reg(ADNS3080_PRODUCT_ID);
  if(pid != ADNS3080_PRODUCT_ID_VAL)
    return -1;

  // turn on sensitive mode
  mousecam_write_reg(ADNS3080_CONFIGURATION_BITS, 0x19);
  return 0;
}

void drive_ofs::mousecam_write_reg(int reg, int val){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(reg | 0x80);
  SPI.transfer(val);
  digitalWrite(PIN_MOUSECAM_CS,HIGH);
  delayMicroseconds(50);
}

int drive_ofs::mousecam_read_reg(int reg){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(reg);
  delayMicroseconds(75);
  int ret = SPI.transfer(0xff);
  digitalWrite(PIN_MOUSECAM_CS,HIGH); 
  delayMicroseconds(1);
  return ret;
}

char drive_ofs::asciiart(int k)
{
  static char foo[] = "WX86*3I>!;~:,`. ";
  return foo[k>>4];
}

void drive_ofs::mousecam_read_motion(struct MD *p){
  digitalWrite(PIN_MOUSECAM_CS, LOW);
  SPI.transfer(ADNS3080_MOTION_BURST);
  delayMicroseconds(75);
  p->motion =  SPI.transfer(0xff);
  p->dx =  SPI.transfer(0xff);
  p->dy =  SPI.transfer(0xff);
  p->squal =  SPI.transfer(0xff);
  p->shutter =  SPI.transfer(0xff)<<8;
  p->shutter |=  SPI.transfer(0xff);
  p->max_pix =  SPI.transfer(0xff);
  digitalWrite(PIN_MOUSECAM_CS,HIGH); 
  delayMicroseconds(5);
}

void drive_ofs::update(MD *p){
    int val = mousecam_read_reg(ADNS3080_PIXEL_SUM);
    mousecam_read_motion(p);

    distance_x = p->dx; //convTwosComp(md.dx);
    distance_y = p->dy; //convTwosComp(md.dy);

    dy_buffer[buff_i] = distance_y;

    total_x1 = (total_x1 + distance_x);
    total_y1 = (total_y1 + distance_y);

    total_x = 10*total_x1/157; //Conversion from counts per inch to mm (400 counts per inch)
    total_y = 10*total_y1/157; //Conversion from counts per inch to mm (400 counts per inch)
}

void drive_ofs::setup(){
  pinMode(PIN_SS,OUTPUT);
  pinMode(PIN_MISO,INPUT);
  pinMode(PIN_MOSI,OUTPUT);
  pinMode(PIN_SCK,OUTPUT);
  
  SPI.begin();
  SPI.setClockDivider(SPI_CLOCK_DIV32);
  SPI.setDataMode(SPI_MODE3);
  SPI.setBitOrder(MSBFIRST);
  
  Serial.begin(38400);
  
  if(mousecam_init()==-1)
  {
    Serial.println("Mouse cam failed to init");
    while(1);
  }
}

void drive_ofs::clear(){
    total_x1 = 0;
    total_y1 = 0;
    total_x = 0;
    total_y = 0;
}

float drive_ofs::getAvgdy(){
  return ((float)(dy_buffer[0] + dy_buffer[1] + dy_buffer[2] + dy_buffer[3] + dy_buffer[4]))/5.0f;
}
