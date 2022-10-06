/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import { Button, Container } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import JamiLogo from '../../public/jami-logo-icon.svg';

const list = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.3,
    },
  },
};
const item = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: 0 },
};

export default function WelcomeAnimation(props) {
  const [visible, setVisible] = useState(true);

  return (
    <Container style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
            onAnimationComplete={(a) => {
              if (a === 'hidden') {
                props.onComplete();
              } else if (!props.showSetup) {
                setVisible(false);
              }
            }}
          >
            <motion.div variants={item}>
              <JamiLogo size="32px" />
            </motion.div>
            <motion.h1 variants={item}>Welcome to Jami</motion.h1>
            {props.showSetup && (
              <motion.div variants={item}>
                <Button variant="outlined" onClick={() => setVisible(false)}>
                  Start setup
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
