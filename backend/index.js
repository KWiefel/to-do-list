const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { readJsonFile, writeJsonFile } = require("./fsUtils");

dotenv.config();
const app = express();

app.use(cors());

app.use((req, _, next) => {
  console.log("new request", req.method, req.url);
  next();
});

app.use(express.json());

// FILTER

function hasTitle(todo, title) {
  if (typeof title === "undefined") {
    return true;
  }
  return todo.description.toLowerCase().includes(titleSearch.toLowerCase());
}

// GET All lists
app.get("/api/lists", (_, res) => {
  readJsonFile("./data.json")
    .then((lists) => lists.map((list) => ({ id: list.id, name: list.name })))
    .then((checklistsShallow) =>
      res.json({ success: true, result: checklistsShallow })
    );
});

// GET list By Id
app.get("/api/lists/:listId", (req, res) => {
  const titleSearch = req.query.titleSearch;
  readJsonFile("./data.json")
    .then((lists) =>
      lists.find((list) => list.id.toString() === req.params.listId)
    )
    // .then((list) => {
    //   const foundList = list.filter((todo) => hasTitle(todo, titleSearch));
    //   res.json({ success: true, result: foundList });
    // });
    .then((foundList) => {
      if (!foundList)
        res.status(404).json({ success: false, error: "List not found" });
      else res.status(200).json({ success: true, result: foundList });
    });
});

// ein neues To-Do hinzufügen
app.post("/api/lists/:listId/items/addItem", (req, res) => {
  // hier kommt die Beschreibung meines neuen To-Do´s durch die request aus dem Frontend
  const newChecklistItemDesc = req.body.description;

  // ich lese die aktuellen To-Do´s aus und suche die korrekte Liste anhand der request aus dem Frontend
  readJsonFile("./data.json")
    .then((lists) => {
      const foundList = lists.find(
        (list) => list.id.toString() === req.params.listId
      );

      // Error Handling falls meine Liste nicht gefunden wird
      if (!foundList)
        res.status(404).json({ success: false, error: "List not found" });

      // ich definiere mein gesamtes Objekt weil ich über die request nur die description bekomme
      const newChecklistItem = {
        itemId: foundList.items[foundList.items.length - 1].itemId + 1,
        description: newChecklistItemDesc,
        checked: false,
      };

      // ich kopiere meine bestehende Liste und füge mein neues To-Do an
      const listWithNewItem = {
        ...foundList,
        items: [...foundList.items, newChecklistItem],
      };

      // ich suche erneut die richtige Liste und füge die kopierte Liste mit dem neuen To-Do ein
      const newListsData = lists.map((checklist) => {
        if (checklist.id.toString() === req.params.listId) {
          return listWithNewItem;
        } else {
          return checklist; // leave untouched
        }
      });

      // ich returne meine neue Liste als promise
      return newListsData;
    })
    // ich nutze meine write Funktion um mit der neuen Liste die alte zu überschreiben
    .then((newListsData) => writeJsonFile("./data.json", newListsData))
    // ich resolve die anfrage
    .then((newListsData) => {
      const updatedList = newListsData.find(
        (list) => list.id.toString() === req.params.listId
      );
      res.json({ success: true, result: updatedList });
    });
});

// ein To-Do als erledigt markieren
app.patch("/api/lists/:listId/items/:itemId/toggleChecked", (req, res) => {
  readJsonFile("./data.json")
    .then((lists) => {
      const BAD_REQUEST_STATUS = 400;
      // find the list
      const foundList = lists.find(
        (list) => list.id.toString() === req.params.listId
      );
      if (!foundList) {
        res
          .status(BAD_REQUEST_STATUS)
          .json({ success: false, error: "List doesn't exist" });
        return;
      }
      // find the item in the list
      const foundListItem = foundList.items.find(
        (item) => item.itemId.toString() === req.params.itemId
      );
      if (!foundListItem) {
        res
          .status(BAD_REQUEST_STATUS)
          .json({ success: false, error: "Listitem doesn't exist" });
        return;
      }

      const checklistWithUpdatedItem = {
        ...foundList,
        items: foundList.items.map((item) => {
          if (item.itemId.toString() === req.params.itemId) {
            return { ...item, checked: !item.checked }; // Toggle the checked on the correct listitem
          } else {
            return item; // leave other items untouched
          }
        }),
      };

      const newListsData = lists.map((checklist) => {
        if (checklist.id.toString() === req.params.listId) {
          return checklistWithUpdatedItem;
        } else {
          return checklist; // leave untouched
        }
      });

      return newListsData;
    })
    .then((newListsData) => writeJsonFile("./data.json", newListsData))
    .then((newListsData) => {
      const updatedList = newListsData.find(
        (list) => list.id.toString() === req.params.listId
      );
      res.json({ success: true, result: updatedList });
    });
});

// löschen eines To-Do´s
app.delete("/api/lists/:listId/items/:itemId", (req, res) => {
  readJsonFile("./data.json")
    .then((lists) => {
      const BAD_REQUEST_STATUS = 400;
      // find the list
      const foundList = lists.find(
        (list) => list.id.toString() === req.params.listId
      );
      if (!foundList) {
        res
          .status(BAD_REQUEST_STATUS)
          .json({ success: false, error: "List doesn't exist" });
        return;
      }

      const listWithDeletedItem = {
        ...foundList,
        // "Die items der neuen liste, sind alle items die nicht die gegebene itemId haben"
        items: foundList.items.filter(
          (item) => !(item.itemId.toString() === req.params.itemId)
        ),
      };
      const newListsData = lists.map((checklist) => {
        if (checklist.id.toString() === req.params.listId) {
          return listWithDeletedItem;
        } else {
          return checklist; // leave untouched
        }
      });

      return newListsData;
    })
    .then((newListsData) => writeJsonFile("./data.json", newListsData))
    .then((newListsData) => {
      const updatedList = newListsData.find(
        (list) => list.id.toString() === req.params.listId
      );
      res.json({ success: true, result: updatedList });
    });
});

// endpoint not found handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
