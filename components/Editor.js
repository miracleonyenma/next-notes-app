import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { CheckCircleIcon } from "@heroicons/react/solid";

import { useNote, useDispatchNote, useNotes, useDispatchNotes } from "../modules/AppContext";

import RandomID from "../modules/RandomID";

const Editor = () => {
  // useSession() returns an object containing two values: data and status
  const { data: session, status } = useSession();

  // the current note
  const currentNote = useNote();
  const setCurrentNote = useDispatchNote();

  // the array of saved notes
  const notes = useNotes();
  const setNotes = useDispatchNotes();

  // editor note states
  const [title, setTitle] = useState("Hola");
  const [body, setBody] = useState(
    `There once was a ship that put to sea
and the name of the ship was the billy old tea`
  );
  const [noteID, setNoteID] = useState(null);
  const [noteAction, setNoteAction] = useState("add");
  const [isSaved, setIsSaved] = useState(false);

  // user data
  const [userID, setUserID] = useState(null);

  // function to update textarea content and height
  const updateField = (e) => {
    // get textarea
    let field = e.target;

    //set body state to textarea value
    setBody(field.value);

    // reset textarea height
    field.style.height = "inherit";

    // Get the computed styles for the textarea
    let computed = window?.getComputedStyle(field);

    // calculate the height
    let height =
      parseInt(computed.getPropertyValue("border-top-width"), 10) +
      parseInt(computed.getPropertyValue("padding-top"), 10) +
      field.scrollHeight +
      parseInt(computed.getPropertyValue("padding-bottom"), 10) +
      parseInt(computed.getPropertyValue("border-bottom-width"), 10);

    // set the new height
    field.style.height = `${height}px`;
  };

  // function to save note to saved notes array
  const saveNote = async () => {
    if (title && body) {
      // check if note already has an ID, if it does asign the current id to the note object,
      // if not, assign a new random ID to the note object
      // let id = noteID || RandomID(title.slice(0, 5), 5);
      // let id = noteID;

      // set userId
      setUserID(session.user.id);

      // the note object
      let note = {
        // id,
        title,
        body,
        userId: userID,
      };

      console.log({ note });

      try {
        if (noteAction == "edit") {
          // add note id to note data
          note.id = noteID;

          // send request to edit note
          let res = await fetch("/api/note", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note),
          });

          // update note
          const updatedNote = await res.json();
          console.log("Update successful", { updatedNote });

          // edit in notes list
          setNotes({ note: updatedNote, type: "edit" });
          console.log({ note, noteAction, noteID, notes });
        } else {
          // send create request with note data
          let res = await fetch("/api/note", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(note),
          });

          const newNote = await res.json();
          console.log("Create successful", { newNote });
          // add to notes list
          setNotes({ note: newNote, type: "add" });
        }

        // change isSaved state to true, thereby disabling the save button
        setIsSaved(true);

        // clear note content
        note = { title: "", body: "" };

        // clear editor
        setTitle(note.title);
        setBody(note.body);

        // clear current note state
        setCurrentNote(note);

        // clear note ID & action
        setNoteID(null);
        setNoteAction("add");
      } catch (error) {
        console.log(error);
      }
    }
  };

  // enable the button whenever the content of title & body changes
  useEffect(() => {
    if (title && body) setIsSaved(false);
    else setIsSaved(true);
  }, [title, body]);

  // update the editor content whenever the note context changes
  // this acts like a listener whenever the user clicks on edit note
  // since the edit note funtion, sets
  useEffect(() => {
    if (currentNote.title && currentNote.body) {
      setTitle(currentNote.title);
      setBody(currentNote.body);
      setNoteID(currentNote.id);
      setNoteAction(currentNote.action);
    }
  }, [currentNote]);

  return (
    status === "authenticated" && (
      <div className={"editor"}>
        <div className={"wrapper"}>
          <div className="editing-area">
            <div className="title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className={"form-input"} placeholder="Title" />
            </div>
            <div className="body">
              <textarea
                value={body}
                onChange={(e) => updateField(e)}
                name="note-body"
                id="note-body"
                className="form-textarea"
                cols="10"
                rows="2"
                placeholder="Write something spec ✨"
              ></textarea>
            </div>
          </div>
          <ul className={"options"}>
            <li className={"option"}>
              <button onClick={saveNote} disabled={isSaved} className="cta flex gap-2 items-end">
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                <span className="">{isSaved ? "Saved" : "Save"}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    )
  );
};

export default Editor;
