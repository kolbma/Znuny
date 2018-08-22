# --
# Copyright (C) 2001-2018 OTRS AG, https://otrs.com/
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file COPYING for license information (GPL). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --

package Kernel::Output::HTML::LayoutPopup;

use strict;
use warnings;

use vars qw(@ISA $VERSION);

=head1 NAME

Kernel::Output::HTML::LayoutPopup - CSS/JavaScript

=head1 SYNOPSIS

All valid functions.

=head1 PUBLIC INTERFACE

=over 4

=cut

=item PopupClose()

Generate a small HTML page which closes the popup window and
executes an action in the main window.

    # load specific URL in main window
    $LayoutObject->PopupClose(
        URL => "Action=AgentTicketZoom;TicketID=$TicketID"
    );

    or

    # reload main window
    $Self->{LayoutObject}->PopupClose(
        Reload => 1,
    );

=cut

sub PopupClose {
    my ( $Self, %Param ) = @_;

    if ( !$Param{URL} && !$Param{Reload} ) {
        $Self->{LogObject}->Log(
            Priority => 'error',
            Message  => 'Need URL or Reload!'
        );
        return;
    }

    # add session if if no cookies enabled
    if ( $Self->{SessionID} && !$Self->{SessionIDCookie} ) {
        $Param{URL} .= ';' . $Self->{SessionName} . '=' . $Self->{SessionID};
    }

    # Generate the call Header() and Footer(
    my $Output = $Self->Header( Type => 'Small' );

    if ( $Param{URL} ) {
        $Self->Block(
            Name => 'LoadParentURLAndClose',
            Data => {
                URL => $Param{URL},
            },
        );
    }
    else {
        $Self->Block(
            Name => 'ReloadParentAndClose',
        );
    }
    $Output .= $Self->Output( TemplateFile => 'AgentTicketActionPopupClose' );
    $Output .= $Self->Footer( Type => 'Small' );
    return $Output;
}

1;

=back

=head1 TERMS AND CONDITIONS

This software is part of the OTRS project (L<https://otrs.org/>).

This software comes with ABSOLUTELY NO WARRANTY. For details, see
the enclosed file COPYING for license information (GPL). If you
did not receive this file, see L<https://www.gnu.org/licenses/gpl-3.0.txt>.

=cut

=cut