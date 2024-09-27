"use client"

import type { NextPage } from 'next';
import HeartRateMonitor from './components/HeartRateMonitor';

const Home: NextPage = () => {
  return (
    <div>
      <HeartRateMonitor />
    </div>
  );
};

export default Home;
