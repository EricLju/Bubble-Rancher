//bub_font_styles.js - Style options for pixi text.

//Stage titles. The floating bubbles with one letter each.
var styleTitleText = {
  font : 'Arial',
  fontStyle: 'italic',
  fontWeight: 'bold',
  fontSize: 36,
  fill : '#FFF',
  stroke : '#000',
  strokeThickness : 6,
  dropShadow: true,
  dropShadowColor: '#000',
  dropShadowBlur: 1,
  dropShadowAngle: toRadians(30),
  dropShadowDistance: 3,
  miterLimit: 4
};

var styleButtonText = {
  font : 'Arial',
  fontSize: 36, 
  fontWeight: '800',
  fill : '#FFFFFF', 
  stroke : '#000000', 
  strokeThickness : 5,
  lineJoin: 'round'
};


var styleLoadText = {
  font : 'Arial', 
  fontSize: 24, 
  fontWeight: 'bold',
  fill : '#FFFFFF',
  stroke : '#000000',
  strokeThickness : 5,
  lineJoin: 'round'
};

var styleSmallTitle = {
  font : 'Arial',
  fontSize: 24, 
  fill : '#FFFFFF',
  stroke : '#000000',
  strokeThickness : 4,
  lineJoin: 'round',
  align: 'center'
};

var styleGeneralText1 = {
  font : '18px Arial',
  fill : '#FFFFFF',
  align: 'center',
  stroke : '#000000',
  strokeThickness : 3,
  lineJoin: 'round'
};

//Trying to emulate an html links style.
var styleLinkText = {
  font : '18px Arial',
  fill : '#0000EE',
  fontStyle: "italic",
  align: 'center',
  stroke : '#AACCEE',
  strokeThickness : 3,
  lineJoin: 'round'
};

var styleGeneralTextSmall = {
  font : '16px Arial',
  fill : '#FFFFFF',
  stroke : '#000000',
  align: 'center',
  strokeThickness : 3,
  lineJoin: 'bevel'
};

var styleScoreText = {
  font : '16px Arial',
  fill : '#FFFFFF',
  stroke : '#000000',
  strokeThickness : 3,
  lineJoin: 'bevel'
};