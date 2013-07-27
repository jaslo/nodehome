/*******************************************************************************
*
* @SOURCE  AstroAlgo.js
* @VERSION 1.0.0
*
* @HISTORY
* 2003-Feb-15 created from AstroAlgo std C library by Todd A. Guillory
*
********************************************************************************
*
* COPYRIGHT NOTICE
* Copyright (C) 2003 Todd A. Guillory
* TAG Digital Studios
* http://www.raydreams.com/
* tag@raydreams.com
*
*******************************************************************************/

// degress radian = 0.01745329251994329547437168
var DEGRAD = (Math.atan2(1,1) * 4) / 180.0;


function ZeroHourJulian(inJulian)
{
﻿  return Math.floor(inJulian - 0.5) + 0.5;
}

function DayOfWeek(inJulian)
{﻿
﻿  return Math.floor(ZeroHourJulian(inJulian) + 1.5) % 7;
}

function LeapYear(inYear)
{
﻿  var days = 28;﻿  // days in February
﻿
﻿  if ( inYear >= 0 )
﻿  {
﻿  ﻿  days = (inYear % 400 == 0 || inYear % 4 == 0 && inYear % 100 != 0) ? 29 : 28;
﻿  }
﻿  else
﻿  {
﻿  ﻿  days = (inYear % 4 == 0) ? 29 : 28;
﻿  }
﻿
﻿  return days;
}

// make sure month and year are integers and day is float
function Date2Julian(inMonth, inDay, inYear)
{
﻿  var﻿  ﻿  A,B;
﻿  var﻿  ﻿  theMonth = inMonth;
﻿  var﻿  ﻿  theYear = inYear;

﻿  if ( inMonth <= 2 )
﻿  ﻿  { --theYear;  theMonth += 12;  }

﻿  A = Math.floor(theYear/100.0);

﻿  if ( inYear < 1582 )
﻿  ﻿  B = 0;
﻿  else if (inYear > 1582 )
﻿  ﻿  B = 2 - A + Math.floor(A/4.0);
﻿  else
    {
﻿  ﻿  if ( inMonth < 10 )
﻿  ﻿  ﻿  B = 0;
﻿  ﻿  else if ( inMonth > 10 )
﻿  ﻿  ﻿  B = 2 - A + Math.floor(A/4.0);
﻿  ﻿  else
﻿  ﻿  {
﻿  ﻿  ﻿  if ( inDay < 5 )
﻿  ﻿  ﻿  ﻿  B = 0;
﻿  ﻿  ﻿  else if ( inDay >= 15 )
﻿  ﻿  ﻿  ﻿  B = 2 - A + Math.floor(A/4.0);
﻿  ﻿  ﻿  else
﻿  ﻿  ﻿  ﻿  { return -1; } /* error, days falls on 10/5/1582 - 10/14/1582 */
﻿  ﻿  } /* end middle else */
﻿  } /* end outer else */

﻿  /* Julian Day */
﻿  return Math.floor(365.25 * (theYear + 4716.0)) + Math.floor(30.6001 * (theMonth + 1.0)) + inDay + B - 1524.5;
}

/*******************************************************************************
* @FUNCTION AADate
* @INPUT    inJD - Julian Day to create an Astronomical Date for
* @OUTPUT   none
* @PURPOSE  Date object that spands back to Julian Day 0 (4712 BC)
* @HISTORY
* 2003-Feb-16 create
*******************************************************************************/
function AADate(inJD)
{
﻿  this.jd = inJD;﻿  ﻿  // Julian Day
﻿  this.valid = true;﻿  // error bit that gets set if the date is invalid
﻿
﻿  // calculate month, day and year
﻿  var﻿  A,B,C,D,E,F,J,Z;
﻿  var﻿  alpha;

﻿  J = this.jd + 0.5;

﻿  Z = Math.floor(J);

﻿  F = J - Z;

﻿  if ( Z >= 2299161 )
﻿  {
﻿  ﻿  alpha = Math.floor( (Z - 1867216.25)/36524.25 );
﻿  ﻿  A = Z + 1 + alpha - Math.floor(alpha/4);
﻿  }
﻿  else
﻿  ﻿  A = Z;

﻿  B = A + 1524;

﻿  C = Math.floor( (B - 122.1)/365.25 );

﻿  D = Math.floor( 365.25 * C );

﻿  E = Math.floor( (B - D)/30.6001 );

﻿  // calculate day
﻿  this.day = B - D - Math.floor(30.6001 * E) + F;

﻿  // calculate month
﻿  if ( E < 14 )
﻿  ﻿  this.month = Math.floor(E - 1.0);
﻿  else if ( E == 14 || E == 15 )
﻿  ﻿  this.month = Math.floor(E - 13.0);
﻿  else
﻿  ﻿  this.valid = false; // error

﻿  // calculate year
﻿  if ( this.month > 2 )
﻿  ﻿  this.year = Math.floor(C - 4716.0);
﻿  else if ( this.month == 1 || this.month == 2 )
﻿  ﻿  this.year = Math.floor(C - 4715.0);
    else
    ﻿  this.valid = false; // error
}

/*******************************************************************************
* @FUNCTION MoonPhase
* @INPUT    inYear - day closest to phase date as a fractional year
*           inPhase - lunar phase to calcualte
* @Lunar Phases: newmoon = 0, firstquarter = 1, fullmoon = 2, lastquarter = 3
* @OUTPUT   day and time phase occurs in Julian Day
* @HISTORY
* 2003-Feb-16 converted to JavaScript from std C
*******************************************************************************/
function MoonPhase(inYear, inPhase)
{
﻿  var﻿  k = 0;
﻿  var﻿  t = 0;﻿  ﻿  ﻿  ﻿  // time in Julian centuries
﻿  var﻿  m = 0;﻿  ﻿  ﻿  ﻿  // Sun's mean anomaly
﻿  var﻿  mprime = 0;﻿  ﻿  ﻿  // Moon's mean anomaly
﻿  var﻿  f = 0;﻿  ﻿  ﻿  ﻿  // Moon's argument of latitude
﻿  var﻿  omega = 0;﻿  ﻿  ﻿  // Longitude of the ascending node of the lunar orbit
﻿  var﻿  w = 0;﻿  ﻿  ﻿  ﻿  // quarter phase corrections
﻿  var﻿  a = new Array(14);﻿  // planatary arguments
﻿  var﻿  atotal = 0;﻿  ﻿  ﻿  // sum of planatary arguments
﻿  var﻿  corrections = 0;﻿  // sum of corrections
﻿  var﻿  e = 0;﻿  ﻿  ﻿  ﻿  // eccentricity of Earth's orbit
﻿
﻿  k = Math.floor((inYear - 2000.0) * 12.3685) + (inPhase * 0.25);
﻿
﻿  t = (k/1236.85);
﻿
﻿  e = 1.0 - t * ( 0.002516 - ( 0.0000074 * t)); // pg 308 in Astronomical Algorithms
﻿
﻿  m = DEGRAD * (2.5534 + (29.10535669 * k) - t * t * ( 0.0000218  - (0.00000011 * t )));
﻿
﻿  mprime = DEGRAD * (201.5643 + (385.81693528 * k) + t * t * ( 0.0107438 + (0.00001239 * t) - (0.000000058 * t * t)));
﻿
﻿  f = DEGRAD * (160.7108 + (390.67050274 * k) + t * t * ( 0.0016341  + (0.00000227 * t) - (0.000000011 * t * t)));
﻿
﻿  omega = DEGRAD * (124.7746 - (1.56375580 * k) + t * t * ( 0.0020691 + (0.00000215 * t)));
﻿
﻿  a[0] =  DEGRAD * (299.77 + (0.107408  * k) - (0.009173 * t * t));
﻿  a[1] =  DEGRAD * (251.88 + (0.016321  * k));
﻿  a[2] =  DEGRAD * (251.83 + (26.651886 * k));
﻿  a[3] =  DEGRAD * (349.42 + (36.412478 * k));
﻿  a[4] =  DEGRAD * (84.66  + (18.206239 * k));
﻿  a[5] =  DEGRAD * (141.74 + (53.303771 * k));
﻿  a[6] =  DEGRAD * (207.14 + (2.453732  * k));
﻿  a[7] =  DEGRAD * (154.84 + (7.306860  * k));
﻿  a[8] =  DEGRAD * (34.52  + (27.261239 * k));
﻿  a[9] =  DEGRAD * (207.19 + (0.121824  * k));
﻿  a[10] = DEGRAD * (291.34 + (1.844379  * k));
﻿  a[11] = DEGRAD * (161.72 + (24.198154 * k));
﻿  a[12] = DEGRAD * (239.56 + (25.513099 * k));
﻿  a[13] = DEGRAD * (331.55 + (3.592518  * k));
﻿
﻿  atotal = .000001 * ((325 * Math.sin(a[0]))
﻿  ﻿  ﻿  ﻿  +  (165 * Math.sin(a[1]))
﻿  ﻿  ﻿  ﻿  +  (164 * Math.sin(a[2]))
﻿  ﻿  ﻿  ﻿  +  (126 * Math.sin(a[3]))
﻿  ﻿  ﻿  ﻿  +  (110 * Math.sin(a[4]))
﻿  ﻿  ﻿  ﻿  +  ( 62 * Math.sin(a[5]))
﻿  ﻿  ﻿  ﻿  +  ( 60 * Math.sin(a[6]))
﻿  ﻿  ﻿  ﻿  +  ( 56 * Math.sin(a[7]))
﻿  ﻿  ﻿  ﻿  +  ( 47 * Math.sin(a[8]))
﻿  ﻿  ﻿  ﻿  +  ( 42 * Math.sin(a[9]))
﻿  ﻿  ﻿  ﻿  +  ( 40 * Math.sin(a[10]))
﻿  ﻿  ﻿  ﻿  +  ( 37 * Math.sin(a[11]))
﻿  ﻿  ﻿  ﻿  +  ( 35 * Math.sin(a[12]))
﻿  ﻿  ﻿  ﻿  +  ( 23 * Math.sin(a[13])));
﻿
﻿  switch (inPhase)
﻿  {﻿
﻿  ﻿  case (0):
﻿  ﻿  {
﻿  ﻿  ﻿  corrections = - (0.40720 *﻿  ﻿  Math.sin(mprime))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.17241 * e *﻿  Math.sin(m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.01608 *﻿  ﻿  Math.sin(2*mprime))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.01039 *﻿  ﻿  Math.sin(2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00739 * e *      Math.sin(mprime - m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00514 * e *      Math.sin(mprime + m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00208 * e * e *  Math.sin(2 * m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00111 *          Math.sin(mprime - 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00057 *          Math.sin(mprime + 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00056 * e *      Math.sin(2 * mprime + m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00042 *          Math.sin(3 * mprime))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00042 * e *      Math.sin(m + 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00038 * e *      Math.sin(m - 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00024 * e *      Math.sin(2 * mprime - m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00017 *          Math.sin(omega))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00007 *          Math.sin(mprime + 2 * m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00004 *          Math.sin(2 * mprime - 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00004 *          Math.sin(3 * m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00003 *          Math.sin(mprime + m - 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00003 *          Math.sin(2 * mprime + 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00003 *          Math.sin(mprime + m + 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00003 *          Math.sin(mprime - m + 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00002 *          Math.sin(mprime - m - 2 * f))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  - (0.00002 *          Math.sin(3 * mprime + m))
﻿  ﻿  ﻿  ﻿  ﻿  ﻿  + (0.00002 *          Math.sin(4 * mprime));
﻿  ﻿  ﻿  break;
﻿  ﻿  }

    case (2) :
    ﻿  {
  ﻿  ﻿  corrections = - (0.40614 *     Math.sin(mprime))
                  + (0.17302 * e *     Math.sin(m))
                  + (0.01614 *         Math.sin(2*mprime))
                  + (0.01043 *         Math.sin(2 * f))
                  + (0.00734 * e *     Math.sin(mprime - m))
                  - (0.00515 * e *     Math.sin(mprime + m))
                  + (0.00209 * e * e * Math.sin(2 * m))
                  - (0.00111 *         Math.sin(mprime - 2 * f))
                  - (0.00057 *         Math.sin(mprime + 2 * f))
                  + (0.00056 * e *     Math.sin(2 * mprime + m))
                  - (0.00042 *         Math.sin(3 * mprime))
                  + (0.00042 * e *     Math.sin(m + 2 * f))
                  + (0.00038 * e *     Math.sin(m - 2 * f))
                  - (0.00024 * e *     Math.sin(2 * mprime - m))
                  - (0.00017 *         Math.sin(omega))
                  - (0.00007 *         Math.sin(mprime + 2 * m))
                  + (0.00004 *         Math.sin(2 * mprime - 2 * f))
                  + (0.00004 *         Math.sin(3 * m))
                  + (0.00003 *         Math.sin(mprime + m - 2 * f))
                  + (0.00003 *         Math.sin(2 * mprime + 2 * f))
                  - (0.00003 *         Math.sin(mprime + m + 2 * f))
                  + (0.00003 *         Math.sin(mprime - m + 2 * f))
                  - (0.00002 *         Math.sin(mprime - m - 2 * f))
                  - (0.00002 *         Math.sin(3 * mprime + m))
                  + (0.00002 *         Math.sin(4 * mprime));
  ﻿  ﻿  ﻿  break;
  ﻿  ﻿  }

  ﻿  case (1):
  ﻿  case (3):
  ﻿  {
  ﻿  ﻿  corrections = - (0.62801 *     Math.sin(mprime))
                  + (0.17172 * e *     Math.sin(m))
                  - (0.01183 * e *     Math.sin(mprime + m))
                  + (0.00862 *         Math.sin(2 * mprime))
                  + (0.00804 *         Math.sin(2 * f))
                  + (0.00454 * e *     Math.sin(mprime - m))
                  + (0.00204 * e * e * Math.sin(2 * m))
                  - (0.00180 *         Math.sin(mprime - 2 * f))
                  - (0.00070 *         Math.sin(mprime + 2 * f))
                  - (0.00040 *         Math.sin(3 * mprime))
                  - (0.00034 * e *     Math.sin(2 * mprime - m))
                  + (0.00032 * e *     Math.sin(m + 2 * f))
                  + (0.00032 * e *     Math.sin(m - 2 * f))
                  - (0.00028 * e * e * Math.sin(mprime + 2 * m))
                  + (0.00027 * e *     Math.sin(2 * mprime + m))
                  - (0.00017 *         Math.sin(omega))
                  - (0.00005 *         Math.sin(mprime - m - 2 * f))
                  + (0.00004 *         Math.sin(2 * mprime + 2 * f))
                  - (0.00004 *         Math.sin(mprime + m + 2 * f))
                  + (0.00004 *         Math.sin(mprime - 2 * m))
                  + (0.00003 *         Math.sin(mprime + m - 2 * f))
                  + (0.00003 *         Math.sin(3 * m))
                  + (0.00002 *         Math.sin(2 * mprime - 2 * f))
                  + (0.00002 *         Math.sin(mprime - m + 2 * f))
                  - (0.00002 *         Math.sin(3 * mprime + m));

            w = .00306 - .00038 * e * Math.cos(m) + .00026 * Math.cos(mprime) - .00002 * Math.cos(mprime - m) + .00002 * Math.cos(mprime + m) + .00002 * Math.cos(2*f);

  ﻿  ﻿  ﻿  if ( inPhase == 3 )
  ﻿  ﻿  ﻿  ﻿  w = -w;
  ﻿  ﻿  break;
  ﻿  }
﻿
﻿  ﻿  default:
﻿  ﻿  ﻿  return -1.0;
﻿  }


  return (2451550.09765 + (29.530588853 * k) + (0.0001337 * Math.pow(t,2)) - (0.000000150 * Math.pow(t,3)) + (0.00000000073 * Math.pow(t,4))  + corrections + atotal + w);

}
