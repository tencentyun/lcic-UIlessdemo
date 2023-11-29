import { useEffect, useState } from 'react';
import styles from './style.module.css';

export function Tips(Props: {
  onHide?: any;
  children?: any;
  styles?: any;
  onClick?: any;
}) {
  let [unmounted, setUmounted] = useState(true);
  let [visible, setVsiible] = useState(false);
  useEffect(() => {
    setVsiible(true);
    let unmountTimer: any;
    let timer = setTimeout(() => {
      Props.onHide && Props.onHide();
      setVsiible(false);
      unmountTimer = setTimeout(() => {
        setUmounted(false);
      }, 2000);
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (unmountTimer) {
        clearTimeout(unmountTimer);
      }
    };
  }, [Props]);
  return unmounted ? (
    <div
      onClick={Props.onClick}
      className={`${styles['message']} ${styles['msg-tips']} ${
        visible ? styles['msg-tips-show'] : ''
      }`}
      style={Props.styles}
    >
      {Props.children}
    </div>
  ) : (
    <></>
  );
}
