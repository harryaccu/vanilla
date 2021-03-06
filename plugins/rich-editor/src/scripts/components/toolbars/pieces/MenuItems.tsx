/**
 * @author Adam (charrondev) Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React from "react";
import MenuItem, { IMenuItemData } from "@rich-editor/components/toolbars/pieces/MenuItem";
import classNames from "classnames";
import { flyoutPosition } from "@rich-editor/components/popovers/pieces/flyoutPosition";

interface IProps {
    menuItemData: IMenuItemData[];
    itemRole?: "menuitem" | "menuitemradio";
    orientation?: "horizontal" | "vertical";
    renderAbove?: boolean;
    renderLeft?: boolean;
    legacyMode?: boolean;
    onKeyDown?: (e) => any;
    className?: string;
}

/**
 * A component that when used with MenuItem provides an accessible WCAG compliant Menu implementation.
 *
 * @see https://www.w3.org/TR/wai-aria-practices-1.1/#menu
 */
export default class MenuItems extends React.Component<IProps, {}> {
    public static defaultProps: Partial<IProps> = {
        itemRole: "menuitem",
        orientation: "horizontal",
    };

    private menuItemRefs: Array<MenuItem | null> = [];

    public render() {
        const { menuItemData } = this.props;
        const firstIndex = 0;
        const lastIndex = menuItemData.length - 1;
        return (
            <div
                className={classNames("richEditor-menu", this.props.className)}
                role="menu"
                style={flyoutPosition(!!this.props.renderAbove, !!this.props.renderLeft, !!this.props.legacyMode)}
                aria-orientation={this.props.orientation!}
                onKeyDown={this.props.onKeyDown}
            >
                <div className="richEditor-menuItems">
                    {this.props.menuItemData.map((itemData, index) => {
                        const prevIndex = index === firstIndex ? lastIndex : index - 1;
                        const nextIndex = index === lastIndex ? firstIndex : index + 1;
                        const focusPrevItem = () => {
                            const prevItem = this.menuItemRefs[prevIndex];
                            prevItem && prevItem.focus();
                        };
                        const focusNextItem = () => {
                            const nextItem = this.menuItemRefs[nextIndex];
                            nextItem && nextItem.focus();
                        };
                        return (
                            <MenuItem
                                {...itemData}
                                role={this.props.itemRole!}
                                key={index}
                                focusNextItem={focusNextItem}
                                focusPrevItem={focusPrevItem}
                                ref={ref => this.menuItemRefs.push(ref)}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    /**
     * Focus the first menu item.
     */
    public focusFirstItem() {
        const firstItem = this.menuItemRefs[0];
        firstItem && firstItem.focus();
    }

    /**
     * Focus the last menu item.
     */
    public focusLastItem() {
        const lastIndex = this.menuItemRefs.length - 1;
        const lastItem = this.menuItemRefs[lastIndex];
        lastItem && lastItem.focus();
    }
}
