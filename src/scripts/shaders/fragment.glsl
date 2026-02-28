varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform vec2 uScreenResolution;
uniform vec2 uPositionMaterial;
uniform sampler2D uTexture;
uniform sampler2D uDisp;

float PI = 3.1415;

vec2 getUV(vec2 uv, vec2 texureSize, vec2 planesize){
	// vec2 tempUV = (uv - vec2(.5)) * 2.;
	vec2 tempUV = uv - vec2(.5);

	float planeAspect = planesize.x / planesize.y;
	float textureAspect = texureSize.x / texureSize.y;

	if(planeAspect < textureAspect){
		tempUV = tempUV * vec2(planeAspect/textureAspect, 1.);
	}else{
		tempUV = tempUV * vec2(1., textureAspect/planeAspect);
	}


	tempUV += vec2(0.5);
	return tempUV;
}

void main(){
  vec2 uv = getUV(vUv, uImageResolution, uResolution);

	vec2 displacmentUv = vUv * vec2(uResolution.x / uScreenResolution.x, uResolution.y / uScreenResolution.y) + vec2(((uPositionMaterial.x + uScreenResolution.x * 0.5 - uResolution.x * 0.5) / uScreenResolution.x), ((uScreenResolution.y * 0.5 - uResolution.y * 0.5 ) / uScreenResolution.y));

  vec4 displacement = texture2D(uDisp, displacmentUv);

  float theta = displacement.r * 1.3 * PI * .4;

  vec2 direction = vec2(sin(theta), cos(theta));

  uv = uv + direction * displacement.r * .1;

  vec4 finalTexture = texture2D(uTexture, uv);
  gl_FragColor = finalTexture;
}