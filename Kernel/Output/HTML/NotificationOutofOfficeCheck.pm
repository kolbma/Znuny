# --
# Copyright (C) 2001-2018 OTRS AG, https://otrs.com/
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file COPYING for license information (GPL). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --

package Kernel::Output::HTML::NotificationOutofOfficeCheck;

use strict;
use warnings;

sub new {
    my ( $Type, %Param ) = @_;

    # allocate new hash for object
    my $Self = {};
    bless( $Self, $Type );

    # get needed objects
    for (qw(ConfigObject LogObject DBObject LayoutObject TimeObject UserObject UserID)) {
        $Self->{$_} = $Param{$_} || die "Got no $_!";
    }
    return $Self;
}

sub Run {
    my ( $Self, %Param ) = @_;

    my %UserData = $Self->{UserObject}->GetUserData( UserID => $Self->{UserID} );
    return '' if ( !$UserData{OutOfOffice} );

    my $Time = $Self->{TimeObject}->SystemTime();

    my $Start
        = "$UserData{OutOfOfficeStartYear}-$UserData{OutOfOfficeStartMonth}-$UserData{OutOfOfficeStartDay} 00:00:00";

    my $TimeStart = $Self->{TimeObject}->TimeStamp2SystemTime(
        String => $Start,
    );
    my $End     = "$UserData{OutOfOfficeEndYear}-$UserData{OutOfOfficeEndMonth}-$UserData{OutOfOfficeEndDay} 23:59:59";
    my $TimeEnd = $Self->{TimeObject}->TimeStamp2SystemTime(
        String => $End,
    );
    if ( $TimeStart < $Time && $TimeEnd > $Time ) {
        return $Self->{LayoutObject}->Notify(
            Priority => 'Notice',
            Link     => $Self->{LayoutObject}->{Baselink} . 'Action=AgentPreferences',
            Data =>
                $Self->{LayoutObject}->{LanguageObject}
                ->Translate("You have Out of Office enabled, would you like to disable it?"),
        );
    }
    else {
        return '';
    }
}

1;