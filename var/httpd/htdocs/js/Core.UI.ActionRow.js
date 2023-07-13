// --
// Copyright (C) 2001-2021 OTRS AG, https://otrs.com/
// Copyright (C) 2021 Znuny GmbH, https://znuny.org/
// --
// This software comes with ABSOLUTELY NO WARRANTY. For details, see
// the enclosed file COPYING for license information (GPL). If you
// did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
// --

"use strict";

var Core = Core || {};
Core.UI = Core.UI || {};

/**
 * @namespace Core.UI.ActionRow
 * @memberof Core.UI
 * @author OTRS AG
 * @description
 *      Action row functionality.
 */
Core.UI.ActionRow = (function (TargetNS) {

    /**
     * @private
     * @name TicketElementSelectors
     * @memberof Core.UI.ActionRow
     * @member {Object}
     * @description
     *      The ticket element selectors for the different overviews.
     */
    var TicketElementSelectors = {
            'Small': 'ul.Overview table td input[type="checkbox"][name=TicketID]',
            'Medium': 'ul.Overview input[type="checkbox"][name=TicketID]',
            'Large': 'ul.Overview input[type="checkbox"][name=TicketID]'
        },
    /**
     * @private
     * @name TicketView
     * @memberof Core.UI.ActionRow
     * @member {Object}
     * @description
     *      The active ticket view.
     */
        TicketView;

    if (!Core.Debug.CheckDependency('Core.UI.ActionRow', 'Core.JSON', 'JSON API')) {
        return false;
    }
    if (!Core.Debug.CheckDependency('Core.UI.ActionRow', 'Core.Data', 'Data API')) {
        return false;
    }

    /**
     * @private
     * @name SerializeData
     * @memberof Core.UI.ActionRow
     * @function
     * @returns {String} Query string of the data.
     * @param {Object} Data - The data that should be converted.
     * @description
     *      Converts a given hash into a query string.
     */
    function SerializeData(Data) {
        var QueryString = '';
        $.each(Data, function (Key, Value) {
            QueryString += ';' + encodeURIComponent(Key) + '=' + encodeURIComponent(Value);
        });
        return QueryString;
    }

    /**
     * @name AddActions
     * @memberof Core.UI.ActionRow
     * @function
     * @param {jQueryObject} $Element - The element for which the data is stored.
     * @param {String} JSONString - The JSON string which contains the information about the valid actions of the element (generated by Perl module).
     *      Could also be an javascript object directly.
     * @description
     *      This functions adds information about the valid action of an element to the element.
     *      These information are used to generate the action row individually for this element.
     */
    TargetNS.AddActions = function ($Element, JSONString) {
        var Actions;
        // The element of the given ID must exist, JSONString must not be empty
        if (isJQueryObject($Element)) {
            if (typeof JSONString === 'string') {
                Actions = Core.JSON.Parse(JSONString);
            }
            else {
                Actions = JSONString;
            }

            // save action data to the given element
            Core.Data.Set($Element, 'Actions', Actions);
        }
        else {
            Core.Debug.Log('Element does not exist or no valid data structure passed.');
        }
    };

    /**
     * @name UpdateActionRow
     * @memberof Core.UI.ActionRow
     * @function
     * @param {jQueryObject} $ClickedElement - jQueryObject of the clicked element (normally $(this)).
     * @param {jQueryObject} $Checkboxes - jQueryObject of the checkboxes of the different tickets.
     * @param {jQueryObject} $ActionRow - The jQueryObject of the ActionRow wrapper (normally the <ul>-Element).
     * @description
     *      This function is called on click on the checkbox of an ticket element and updates the action row for this element.
     */
    TargetNS.UpdateActionRow = function ($ClickedElement, $Checkboxes, $ActionRow) {
        var TicketActionData,
            ActionRowElement;

        // Check, if one or more items are selected
        $Checkboxes = $Checkboxes.filter(':checked');
        // No checkbox is selected
        if (!$Checkboxes.length) {
            // Remove actions and deactivate bulk action
            $ActionRow
                .find('li').filter(':not(.AlwaysPresent)').remove()
                .end().end()
                .find('#BulkAction').addClass('Inactive');
        }
        // Exactly one checkbox is selected
        else if ($Checkboxes.length === 1 && !$('#SelectAllTickets').is(':checked')) {
            // Update actions and activate bulk action
            $ActionRow.find('#BulkAction').removeClass('Inactive');

            // Find the element which is active (it must not be the clicked element!)
            // and get the data
            TicketActionData = Core.Data.Get($Checkboxes.closest('li, tr'), 'Actions');
            if (typeof TicketActionData !== 'undefined') {
                $.each(TicketActionData, function (Index, Value) {
                    if (Value.HTML) {
                        $(Value.HTML).attr('id', Value.ID).appendTo($ActionRow);
                        ActionRowElement = $ActionRow.find('#' + Value.ID).find('a');
                        Core.UI.InputFields.InitSelect($('#DestQueueID'), {Force: true});
                        if (typeof Value.Target === 'undefined' || Value.Target === "") {
                            ActionRowElement.attr('href', Value.Link);
                        }
                        if (Value.PopupType) {
                            ActionRowElement.on('click.Popup', function () {
                                Core.UI.Popup.OpenPopup(Value.Link, Value.PopupType);
                                return false;
                            });
                        }
                    }
                });
            }
        }
        // Two ore more checkboxes selected
        else {
            // Remove actions and activate bulk action
            $ActionRow
                .find('li').filter(':not(.AlwaysPresent)').remove()
                .end().end()
                .find('#BulkAction').removeClass('Inactive');
        }
    };

    /**
     * @name Init
     * @memberof Core.UI.ActionRow
     * @function
     * @description
     *      This function initializes the complete ActionRow functionality and binds all click events.
     */
    TargetNS.Init = function () {
        // Get used ticket view mode
        if ($('#TicketOverviewMedium').length) {
            TicketView = 'Medium';
        }
        else if ($('#TicketOverviewLarge').length) {
            TicketView = 'Large';
        }
        else {
            TicketView = 'Small';
        }

        // Hide 'Select all' checkbox in Large and Medium view when table is empty.
        if ((TicketView === 'Medium' || TicketView === 'Large') && $('#EmptyMessage' + TicketView).length === 1) {
            $('#SelectAllTickets').closest('li').addClass('Hidden');
        }

        $('#SelectAllTickets').on('click', function () {
            var Status = $(this).prop('checked');
            $(TicketElementSelectors[TicketView]).prop('checked', Status).triggerHandler('click');
        });

        $(TicketElementSelectors[TicketView]).on('click', function (Event) {
            Event.stopPropagation();
            Core.UI.ActionRow.UpdateActionRow($(this), $(TicketElementSelectors[TicketView]), $('div.OverviewActions ul.Actions'));
            Core.Form.SelectAllCheckboxes($(this), $('#SelectAllTickets'));
        });

        $('#BulkAction a').on('click', function () {
            var $Element = $(this),
                $SelectedTickets,
                TicketIDParameter = "TicketID=",
                TicketIDsURL = "",
                TicketIDs = "",
                URL;
            if ($Element.parent('li').hasClass('Inactive')) {
                return false;
            }
            else {
                $SelectedTickets = $(TicketElementSelectors[TicketView] + ':checked');
                $SelectedTickets.each(function () {
                    TicketIDsURL += TicketIDParameter + $(this).val() + ";";
                    TicketIDs += $(this).val() + ";";
                });
                URL = Core.Config.Get('Baselink') + "Action=AgentTicketBulk;" + TicketIDsURL;
                URL += SerializeData(Core.App.GetSessionInformation());

                Core.AJAX.FunctionCall(
                    Core.Config.Get('CGIHandle'),
                    {
                        'Action'    : 'AgentTicketBulk',
                        'Subaction' : 'AJAXIgnoreLockedTicketIDs',
                        'TicketIDs' :  Core.JSON.Stringify(TicketIDs)
                    },
                    function(Response) {
                        var IgnoreLockedTicketIDs = Core.JSON.Parse(Response);
                        if (IgnoreLockedTicketIDs.Message.length) {

                            Core.UI.Dialog.ShowContentDialog('<p style="width:400px;">' + IgnoreLockedTicketIDs.Message + '</p>', Core.Language.Translate('Cannot proceed') , '150px', 'Center', true, [

                                {
                                    Label: Core.Language.Translate('Close this dialog'),
                                    Function: function () {
                                        Core.UI.Dialog.CloseDialog($('.Dialog:visible'));
                                    }
                                }
                            ]);
                        }
                        else {
                          Core.UI.Popup.OpenPopup(URL, 'TicketAction');
                        }
                    }
                );

            }
            return false;
        });
    };

    Core.Init.RegisterNamespace(TargetNS, 'APP_MODULE');

    return TargetNS;
}(Core.UI.ActionRow || {}));
