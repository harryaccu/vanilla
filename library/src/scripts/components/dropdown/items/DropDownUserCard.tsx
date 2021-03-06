/*
 * @author Stéphane LaFlèche <stephane.l@vanillaforums.com>
 * @copyright 2009-2018 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import * as React from "react";
import classNames from "classnames";
import { UserPhoto, UserPhotoSize } from "@library/components/mebox/pieces/UserPhoto";
import { IInjectableUserState } from "@library/users/UsersModel";
import { connect } from "react-redux";
import UsersModel from "@library/users/UsersModel";
import SmartLink from "@library/components/navigation/SmartLink";

export interface IProps extends IInjectableUserState {
    className?: string;
    photoSize?: UserPhotoSize;
}

/**
 * Implements DropDownUserCard component for DropDown menus.
 */
export class DropDownUserCard extends React.Component<IProps> {
    public render() {
        const currentUser = this.props.currentUser.data!;
        const profileLink = `${window.location.origin}/profile/${currentUser.name}`;
        return (
            <li className={classNames("dropDown-userCard", this.props.className)}>
                <SmartLink to={profileLink} className="userDropDown-userCardPhotoLink">
                    <UserPhoto
                        className="userDropDown-userCardPhoto"
                        userInfo={currentUser}
                        size={this.props.photoSize || UserPhotoSize.LARGE}
                    />
                </SmartLink>
                <SmartLink to={profileLink} className="userDropDown-userCardName" tabIndex={-1}>
                    {currentUser.name}
                </SmartLink>
            </li>
        );
    }
}
const withRedux = connect(UsersModel.mapStateToProps);
export default withRedux(DropDownUserCard);
