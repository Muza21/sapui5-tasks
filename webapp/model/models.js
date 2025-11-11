sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    createBooksModel: function () {
      const oData = {
        books: [
          {
            ID: "b001",
            Name: "Limitless",
            Author: "Jim Kwik",
            Genre: "Self-improvement",
            ReleaseDate: "2020-04-07",
            AvailableQuantity: 5,
          },
          {
            ID: "b002",
            Name: "Atomic Habits",
            Author: "James Clear",
            Genre: "Productivity",
            ReleaseDate: "2018-10-16",
            AvailableQuantity: 8,
          },
          {
            ID: "b003",
            Name: "Deep Work",
            Author: "Cal Newport",
            Genre: "Self-improvement",
            ReleaseDate: "2016-01-05",
            AvailableQuantity: 4,
          },
          {
            ID: "b004",
            Name: "The Pragmatic Programmer",
            Author: "Andrew Hunt, David Thomas",
            Genre: "Technology",
            ReleaseDate: "1999-10-30",
            AvailableQuantity: 3,
          },
          {
            ID: "b005",
            Name: "Thinking, Fast and Slow",
            Author: "Daniel Kahneman",
            Genre: "Psychology",
            ReleaseDate: "2011-10-25",
            AvailableQuantity: 6,
          },
          {
            ID: "b006",
            Name: "Clean Code",
            Author: "Robert C. Martin",
            Genre: "Technology",
            ReleaseDate: "2008-08-01",
            AvailableQuantity: 7,
          },
          {
            ID: "b007",
            Name: "Can't Hurt Me",
            Author: "David Goggins",
            Genre: "Biography",
            ReleaseDate: "2018-12-04",
            AvailableQuantity: 2,
          },
          {
            ID: "b008",
            Name: "Sapiens",
            Author: "Yuval Noah Harari",
            Genre: "History",
            ReleaseDate: "2015-02-10",
            AvailableQuantity: 10,
          },
          {
            ID: "b009",
            Name: "The Alchemist",
            Author: "Paulo Coelho",
            Genre: "Fiction",
            ReleaseDate: "1988-04-15",
            AvailableQuantity: 9,
          },
          {
            ID: "b010",
            Name: "Educated",
            Author: "Tara Westover",
            Genre: "Memoir",
            ReleaseDate: "2018-02-18",
            AvailableQuantity: 5,
          },
        ],
      };
      return new JSONModel(oData);
    },
  };
});
