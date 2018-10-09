# --
# Copyright (C) 2001-2018 OTRS AG, https://otrs.com/
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file COPYING for license information (GPL). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --

package Kernel::Output::HTML::NotificationUIDCheck;

use strict;
use warnings;

sub new {
    my ( $Type, %Param ) = @_;

    # allocate new hash for object
    my $Self = {};
    bless( $Self, $Type );

    # get needed objects
    for (qw(ConfigObject LogObject DBObject LayoutObject UserID)) {
        $Self->{$_} = $Param{$_} || die "Got no $_!";
    }
    return $Self;
}

sub Run {
    my ( $Self, %Param ) = @_;

    # return if it's not root@localhost
    return '' if $Self->{UserID} != 1;

    # show error notfy, don't work with user id 1
    return $Self->{LayoutObject}->Notify(
        Priority => 'Error',
        Link     => $Self->{LayoutObject}->{Baselink} . 'Action=AdminUser',
        Data =>
            $Self->{LayoutObject}->{LanguageObject}->Translate(
            "Don't use the Superuser account to work with OTRS! Create new Agents and work with these accounts instead."
            ),
    );
}

1;