import fprime from "fprime";
import { IViewList, IViewListItem} from "fprime/ViewManagement/ViewManager";
const views: IViewList = fprime.viewManager.ViewList;
const opened: IViewListItem[] = [];
export default {
  state: {
    /**
     * The view list generated from the view manager.
     */
    views,
    /**
     * The opened views. This is the data source for ViewTabs.vue component.
     */
    opened,
  },
  /**
   * GetViewList returns a JSON object with type:
   * INavItem: {
   *  name: string,
   *  children: INavItem[],
   *  route: string,
   *  element: string
   * }
   * This is the type used by the vue-tree-navigation component.
   * See https://misrob.github.io/vue-tree-navigation/#/introduction.
   * When the user click on the navigation item, we should change the
   * route (path)
   * of the program. Thus, we set route to "/view/:viewType/:viewName/edit".
   */
  GetViewList() {
    return Object.keys(views).map((key) => {
      return {
        name: key,
        children: views[key].map((i) => {
          return {
            name: i.name,
            route: this.GetViewRoute(i),
          };
        }),
      };
    });
  },

  /**
   * Open a given view in the tab. If the view is not opened, find the
   * corresponding IViewListItem and push it to the opened list.
   * @param name The name of the view to load.
   * @returns true if the opened list is updated; otherwise false.
   */
  LoadViewByName(name: string): boolean {
    const updated =
      opened
        .filter((i) => i.name === name)
        .length === 0;
    if (updated) {
      opened.push(
        Object.keys(views)
          .map((key) => views[key])
          .reduce((x, y) => x.concat(y))
          .filter((i) => i.name === name)
        [0]);
    }
    return updated;
  },

  /**
   * Close the tab a given view. This will cause the IViewListItem be removed
   * from the opened list.
   * @param name The name of the view to close.
   * @returns The index of the closed view in the opened list. -1 if the view
   * is not in the opened list, meaning that it is not opened.
   */
  CloseViewByName(name: string): number {
    let i;
    for (i = 0; i < opened.length; i++) {
      if (opened[i].name === name) {
        break;
      }
    }
    if (i < opened.length) {
      opened.splice(i, 1);
      // Close the view from ViewManager
      fprime.viewManager.closeViewDescriptor(name);
    }
    return i < opened.length + 1 ? i : -1;
  },

  /**
   * Close all the opening tabs.
   */
  CloseAll() {
    opened.splice(0, opened.length);
  },

  /**
   * Get the IViewListItem of a view with given name.
   * @param name The name of the view.
   * @returns The corresponding view item; null if no view with such name.
   */
  GetViewByName(name: string): IViewListItem | null {
    const namedViews =
      Object.keys(views)
        .map((key) => views[key])
        .reduce((x, y) => x.concat(y))
        .filter((i) => i.name === name);
    if (namedViews.length === 0) {
      return null;
    } else {
      return namedViews[0];
    }
  },

  /**
   * Generate the url for a view item. When the user opens a view, we change
   * the URL to notify the system to load the target view. The URL has the
   * format: "/view/:viewType/:viewName/edit"
   * @param item The view item.
   * @returns The encoded URL.
   */
  GetViewRoute(item: IViewListItem): string {
    return encodeURI("/view/" + item.type + "/" + item.name + "/edit");
  },

  /**
   * Add a new item to the view list.
   * When the user wants to add a new item to the list,
   * create an item with default vaule.
   * @param name The view category aimed to add the item
   */
  addNewItem(name: string, compName?: string): IViewListItem {
    // add a new viewlist item
    if(compName) {
      return fprime.viewManager.addNewItem(name, compName);
    } else {
      return fprime.viewManager.addNewItem(name);
    }
  },

  removeItem(name: string, type: string) {
    fprime.viewManager.removeItem(name, type);
  },
  /**
   * Get all the components in the current model.
   */
  getComponents() {
    return fprime.viewManager.getComponents();
  },

};
