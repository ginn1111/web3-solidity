import React from "react";
import { useEffect, useState } from "react";
import {
  helloWorldContract,
  connectWallet,
  updateMessage,
  loadCurrentMessage,
  getCurrentWalletConnected,
} from "./util/interact.js";

import alchemylogo from "./alchemylogo.svg";
import { Wallet } from "alchemy-sdk";

const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");

  //called only once
  useEffect(() => {
    // load current message on initial
    (async () => {
      const currentMsg = await loadCurrentMessage();
      setMessage(currentMsg);
    })();

    // check exit wallet
    (async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    })();

    const unsubscribeSmartContract = addSmartContractListener();
    const unsubscribeWallet = addWalletListener();

    return () => {
      unsubscribeSmartContract();
      unsubscribeWallet?.();
    };
  }, []);

  function addSmartContractListener() {
    return helloWorldContract.events.UpdatedMessages(
      {},
      function (error, data) {
        if (error) {
          setStatus("😥 " + error.message);
        } else {
          console.log(data);
          setMessage(data.returnValues[1]);
          setNewMessage("");
          setStatus("🎉 Your message has been updated!");
        }
      },
    );
  }

  function addWalletListener() {
    if (window.ethereum) {
      return window.ethereum.on("accountsChanged", function (accounts) {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              href={`https://metamask.io/download`}
              rel="noreferrer"
            >
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>,
      );
    }
  }

  const connectWalletPressed = async () => {
    const { address, status } = await connectWallet();
    setStatus(status);
    setWallet(address);
  };

  const onUpdatePressed = async () => {
    const { status } = await updateMessage(walletAddress, newMessage);

    setStatus(status);
  };

  //the UI of our component
  return (
    <div id="container">
      <img id="logo" src={alchemylogo}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: "50px" }}>Current Message:</h2>
      <p>{message}</p>

      <h2 style={{ paddingTop: "18px" }}>New Message:</h2>

      <div>
        <input
          type="text"
          placeholder="Update the message in your smart contract."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" onClick={onUpdatePressed}>
          Update
        </button>
      </div>
    </div>
  );
};

export default HelloWorld;
