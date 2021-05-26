#pragma once

#include <Arduino.h>
#include "SPI.h"

#define PIN_SS        10
#define PIN_MISO      12
#define PIN_MOSI      11
#define PIN_SCK       13

#define PIN_MOUSECAM_RESET     8
#define PIN_MOUSECAM_CS        7

#define ADNS3080_PIXELS_X                 30
#define ADNS3080_PIXELS_Y                 30

#define ADNS3080_PRODUCT_ID            0x00
#define ADNS3080_REVISION_ID           0x01
#define ADNS3080_MOTION                0x02
#define ADNS3080_DELTA_X               0x03
#define ADNS3080_DELTA_Y               0x04
#define ADNS3080_SQUAL                 0x05
#define ADNS3080_PIXEL_SUM             0x06
#define ADNS3080_MAXIMUM_PIXEL         0x07
#define ADNS3080_CONFIGURATION_BITS    0x0a
#define ADNS3080_EXTENDED_CONFIG       0x0b
#define ADNS3080_DATA_OUT_LOWER        0x0c
#define ADNS3080_DATA_OUT_UPPER        0x0d
#define ADNS3080_SHUTTER_LOWER         0x0e
#define ADNS3080_SHUTTER_UPPER         0x0f
#define ADNS3080_FRAME_PERIOD_LOWER    0x10
#define ADNS3080_FRAME_PERIOD_UPPER    0x11
#define ADNS3080_MOTION_CLEAR          0x12
#define ADNS3080_FRAME_CAPTURE         0x13
#define ADNS3080_SROM_ENABLE           0x14
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_LOWER      0x19
#define ADNS3080_FRAME_PERIOD_MAX_BOUND_UPPER      0x1a
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_LOWER      0x1b
#define ADNS3080_FRAME_PERIOD_MIN_BOUND_UPPER      0x1c
#define ADNS3080_SHUTTER_MAX_BOUND_LOWER           0x1e
#define ADNS3080_SHUTTER_MAX_BOUND_UPPER           0x1e
#define ADNS3080_SROM_ID               0x1f
#define ADNS3080_OBSERVATION           0x3d
#define ADNS3080_INVERSE_PRODUCT_ID    0x3f
#define ADNS3080_PIXEL_BURST           0x40
#define ADNS3080_MOTION_BURST          0x50
#define ADNS3080_SROM_LOAD             0x60

#define ADNS3080_PRODUCT_ID_VAL        0x17

struct MD{
 byte motion;
 char dx, dy;
 byte squal;
 word shutter;
 byte max_pix;
};

class drive_ofs {
    int x=0;
    int y=0;

    int a=0;
    int b=0;

    int distance_x=0;
    int distance_y=0;

    int tdistance = 0;
  
    volatile byte movementflag=0;
    volatile int xydat[2];

    byte frame[ADNS3080_PIXELS_X * ADNS3080_PIXELS_Y];

public:
    long long int total_x = 0; // mm
    long long int total_y = 0; // mm

    long long int total_x1 = 0; // pixels
    long long int total_y1 = 0; // pixels

    drive_ofs():total_x(0), total_y(0), total_x1(0), total_y1(0), x(0), y(0), a(0), b(0), distance_x(0), distance_y(0), tdistance(0), movementflag(0){}
    int convTwosComp(int b);
    void mousecam_reset();
    int mousecam_init();
    void mousecam_write_reg(int reg, int val);
    int mousecam_read_reg(int reg);
    char asciiart(int k);
    void mousecam_read_motion(struct MD *p);

    void update(MD *p); // Pulls new x and y from sensor
    void clear(); // Resets total values (dones before issuing a new transform)
};