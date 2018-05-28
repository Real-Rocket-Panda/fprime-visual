export interface IViewItem {
  id: string;
  name: string;
  type: string;
  diagram: string;
}

export const views: { [key: string]: IViewItem[] } = {
  "Function Views": [
    { id: "1", name: "Topology1", type: "Function Views",
      diagram: "Topology1 Diagram" },
  ],
  "Component Views": [
    { id: "2", name: "Component1", type: "Component Views",
      diagram: "Component1 Diagram" },
    { id: "3", name: "Component2", type: "Component Views",
      diagram: "Component2 Diagram" },
  ],
  "Instance Centric Views": [
    { id: "4", name: "Instance1", type: "Instance Centric Views",
      diagram: "Instance1 Diagram" },
    { id: "5", name: "Instance2", type: "Instance Centric Views",
      diagram: "Instance2 Diagram" },
    { id: "6", name: "Instance3", type: "Instance Centric Views",
      diagram: "Instance3 Diagram" },
  ],
};

/**
 * GetViewList returns a JSON object with type:
 * INavItem: {
 *  name: string,
 *  children: INavItem[],
 *  route: string,
 *  element: string
 * }
 * This is the type used by the vue-tree-navigation component.
 * See https://vue-tree-navigation.misrob.cz/#/introduction.
 * When the user click on the navigation item, we should change the route (path)
 * of the program. Thus, we set route to "/view/:viewType/:viewName".
 */
export function GetViewList() {
  return Object.keys(views).map((key: string) => {
    return {
      name: key,
      children: views[key].map((i: IViewItem) => {
        return {
          name: i.name,
          route: GetViewRoute(i),
        };
      }),
    };
  });
}

export const opened: IViewItem[] = [];

export function LoadViewByName(name: string): boolean {
  const updated = opened.filter((i: IViewItem) => i.name === name).length === 0;
  if (updated) {
    opened.push(
      Object.keys(views)
        .map((key: string) => views[key])
        .reduce((x: IViewItem[], y: IViewItem[]) => x.concat(y))
        .filter((i: IViewItem) => i.name === name)
        [0]);
  }
  return updated;
}

export function CloseViewByName(name: string): number {
  let i;
  for (i = 0; i < opened.length; i++) {
    if (opened[i].name === name) {
      break;
    }
  }
  if (i < opened.length) {
    opened.splice(i, 1);
  }
  return i < opened.length + 1 ? i : -1;
}

export function GetViewByName(name: string): IViewItem {
  return Object.keys(views)
    .map((key: string) => views[key])
    .reduce((x: IViewItem[], y: IViewItem[]) => x.concat(y))
    .filter((i: IViewItem) => i.name === name)
    [0];
}

export function GetViewRoute(item: IViewItem): string {
  return encodeURI("/view/" + item.type + "/" + item.name + "/edit");
}
