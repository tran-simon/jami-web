import List from "@mui/material/List";
import authManager from "../AuthManager";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";


export default function ContactList() {
  const { accountId } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    authManager
      .fetch(`/api/accounts/${accountId}/contacts/`, {
        method: "GET",
        header: { "Content-Type": "application/json" },
        // signal: controller.signal,
      })
      .then((res) => {
        res.json();
      })
      .then((result) => {
        console.log(result);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="rooms-list">
      <List></List>
    </div>
  );
}
