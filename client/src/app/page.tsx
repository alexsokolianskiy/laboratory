'use client';

import styles from "./page.module.css";
import AceEditor from "react-ace";
import { useState, useEffect } from 'react';
import { AVRRunner } from './services/execute';
import classNames from 'classnames';
import "@wokwi/elements";

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

export default function () {
  const code6LED = `
  // LEDs connected to pins 8..13
  byte leds[] = {13, 12, 11, 10, 9, 8};
  void setup() {
    for (byte i = 0; i < sizeof(leds); i++) {
      pinMode(leds[i], OUTPUT);
    }
  }
  
  int i = 0;
  void loop() {
    digitalWrite(leds[i], HIGH);
    delay(250);
    digitalWrite(leds[i], LOW);
    i = (i + 1) % sizeof(leds);
  }`
  const calculatedClassName = (color: string) => {
    return  classNames('', {
      [styles.red]: color === 'red',
      [styles.blue]: color === 'blue',
      [styles.green]: color === 'green',
    });
  }
 
  const [leds, setLeds] = useState([
    { id: 0, pin: 13, value: false, color: 'red' },
    { id: 1, pin: 12, value: false, color: 'blue' },
    { id: 2, pin: 11, value: false, color: 'green' },
    { id: 3, pin: 10, value: false, color: 'red' },
    { id: 4, pin: 9, value: false, color: 'blue' },
    { id: 5, pin: 8, value: false, color: 'green' },
  ]);
  const [code, setCode] = useState(code6LED);
  const [runner, setRunner] = useState<AVRRunner>(new AVRRunner());
  const [status, setStatus] = useState('');
  const [buildResult, setBuildResult] = useState('');
  const [hex, setHex] = useState(null);
  runner.portD.addListener((value) => {
    updateLEDs(value, 0);
  });
  runner.portB.addListener((value) => {
    updateLEDs(value, 8);
  });

  const handleBuildAndUpload = async () => {
    setHex(null);
    try {
      const response = await fetch('http://localhost:8080/api/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setBuildResult(result.output);
        setHex(result.hex);
        setStatus(result.code == 0 ? 'Success' : 'Error');
      } else {
        console.error('Failed to build and upload:', response.statusText);
        setBuildResult('Failed to build and upload');
        setStatus('Error');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setBuildResult('Error during API call');
    }
  };
  const updateLEDs = (value: number, startPin: number) => {
    for (const led of leds) {
      const pin = led.pin;
      if (pin >= startPin && pin <= startPin + 8) {
        setLeds((prevLeds) =>
          prevLeds.map((led) =>
            led.pin === pin ? { ...led, value: value & (1 << (pin - startPin)) ? true : false } : led
          )
        );
      }
    }
  };
  const onChange = (newValue: string) => {
    setCode(newValue);
  };

  useEffect(() => {
    setLeds(leds.map((led) => ({ ...led, value: false })));
    runner.stop();
    if (hex) {
      runner.uploadHex(hex || '');

      runner.execute(() =>{})
    } 

  }, [hex]);


  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
            <AceEditor
            value={code}
            mode="c_cpp"
            theme="monokai"
            name="UNIQUE_ID_OF_DIV"
            onChange={onChange}
            editorProps={{ $blockScrolling: true }}
          />
          <button onClick={handleBuildAndUpload}>Build and Upload</button>
        </div>
        <div className={styles.column}>
    
        {leds.map((led) => (

<wokwi-led key={led.id} color={led.color} label={`LED-${led.id}`}  value={led.value ? true : undefined} ></wokwi-led>
))}

        </div>
      </div>
     
   
      <div>
        <h2>OUTPUT</h2>
        <h3>Status: {status} </h3>
        <div id="output">
          {buildResult}
        </div>
      </div>
    </main >
  );
}
