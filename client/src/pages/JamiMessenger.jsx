import { Route, Routes } from 'react-router-dom';

import Messenger from './messenger.jsx';

export default function JamiMessenger(props) {
  return (
    <Routes>
      <Route path="addContact/:contactId" element={<Messenger />} />
      <Route path="conversation/:conversationId" element={<Messenger />} />
      <Route index path="*" element={<Messenger />} />
    </Routes>
  );
}
