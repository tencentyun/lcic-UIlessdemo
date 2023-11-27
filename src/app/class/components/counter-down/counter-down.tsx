import styles from './style.module.css';

export function CounterDown(Props: { value: number }) {
  return Props.value === 0 ? (
    <></>
  ) : (
    <div className={`${styles['counter-down']}`}>{Props.value}</div>
  );
}
