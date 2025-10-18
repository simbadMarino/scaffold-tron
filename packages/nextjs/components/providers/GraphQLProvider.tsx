"use client";

import { ReactNode } from "react";
import { Provider } from "urql";
import { graphqlClient } from "~~/lib/graphql-client";

interface GraphQLProviderProps {
  children: ReactNode;
}

export const GraphQLProvider = ({ children }: GraphQLProviderProps) => {
  return <Provider value={graphqlClient}>{children}</Provider>;
};
