/* jslint node: true */
"use strict";

var AgentI = require("./agent-i");


exports.analyzeEmail = function(req, res) {
  var email = req.body.email;
  if (email === undefined)
    return res.status(400).json({ error: "Key 'email' not found in request data." });
  if (typeof email !== "string")
    return res.status(400).json({ error: "Expected 'email' to be a string." });
  if (email.length === 0)
    return res.status(400).json({ error: "'email' is empty." });

  AgentI.analyze(email, function(err, response) {
    if (err) return res.status(400).json({ error: err });
    if (!response)
      return res.status(500).json({ error: "AgentI failed to generate email response."});

    return res.status(200).json({ response: response });
  });
};