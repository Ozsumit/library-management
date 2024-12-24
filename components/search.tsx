// // components/Countdown.js
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import styles from "../styles/Countdown.module.css";

// const Countdown = () => {
//   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setTimeLeft(calculateTimeLeft());
//     }, 1000);

//     return () => clearTimeout(timer);
//   });

//   const calculateTimeLeft = () => {
//     const difference = +new Date("2025-01-01T00:00:00") - +new Date();
//     let timeLeft = {};

//     if (difference > 0) {
//       timeLeft = {
//         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//         minutes: Math.floor((difference / 1000 / 60) % 60),
//         seconds: Math.floor((difference / 1000) % 60),
//       };
//     }

//     return timeLeft;
//   };

//   const { days, hours, minutes, seconds } = timeLeft;

//   return (
//     <div className={styles.countdown}>
//       <motion.div
//         className={styles.time}
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         <span>{days}</span> Days
//       </motion.div>
//       <motion.div
//         className={styles.time}
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         <span>{hours}</span> Hours
//       </motion.div>
//       <motion.div
//         className={styles.time}
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         <span>{minutes}</span> Minutes
//       </motion.div>
//       <motion.div
//         className={styles.time}
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1 }}
//       >
//         <span>{seconds}</span> Seconds
//       </motion.div>
//     </div>
//   );
// };

// export default Countdown;
