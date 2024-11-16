import express from "express";

import * as expressValidator from "express-validator";

import {RunnableValidationChains} from "express-validator/src/middlewares/schema";

type Endpoint = [
  RunnableValidationChains<expressValidator.ValidationChain>,
  express.RequestHandler
];

type ControllerProps<T> = {
  [P in keyof T]: Endpoint;
};

export default class Controller {
  static make<T extends {[key: string]: Endpoint}>(
    controller: T
  ): ControllerProps<T> {
    return controller;
  }
}
