import { Route, Routes } from 'react-router-dom';

import Messenger from './Messenger';

export default function JamiMessenger() {
  return (
    <Routes>
      <Route path="addContact/:contactId" element={<Messenger />} />
      <Route path="conversation/:conversationId" element={<Messenger />} />
      <Route path="*" element={<Messenger />} />
    </Routes>
  );
}
