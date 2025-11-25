import { motion } from 'framer-motion';
export default function AnimatedCard({ children }){
  return <motion.div className="card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>{children}</motion.div>
}