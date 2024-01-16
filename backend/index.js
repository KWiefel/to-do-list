const express = require("express");
const cors = require("cors");
const { readJsonFile, writeJsonFile } = require("./fsUtils");

const app = express();

app.use(cors());
app.use((req, _, next) => {
  console.log("new request", req.method, req.url);
  next();
});
app.use(express.json()); // parse body of all incoming requests

// CRUD - Create, Read (All, One), Update, Delete

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
  readJsonFile("./data.json")
    .then((lists) =>
      lists.find((list) => list.id.toString() === req.params.listId)
    )
    .then((foundList) => {
      if (!foundList)
        res.status(404).json({ success: false, error: "List not found" });
      else res.status(200).json({ success: true, result: foundList });
    });
});

app.post("/api/lists/:listId/items", (req, res) => {
  const newChecklistItemDesc = req.body.itemDescription;

  readJsonFile("./data.json")
    .then((lists) => {
      const foundList = lists.find(
        (list) => list.id.toString() === req.params.listId
      );
      if (!foundList)
        res.status(404).json({ success: false, error: "List not found" });
      const newChecklistItem = {
        id: foundList.items[foundList.items.length - 1].itemId + 1, // Increment last id for new item
        description: newChecklistItemDesc,
        checked: false,
      };
      const listWithNewItem = {
        ...foundList,
        items: [...foundList.items, newChecklistItem],
      };
      const newListsData = lists.map((checklist) => {
        if (checklist.id.toString() === req.params.listId) {
          return listWithNewItem;
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
