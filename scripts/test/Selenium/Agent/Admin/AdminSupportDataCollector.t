# --
# Copyright (C) 2001-2021 OTRS AG, https://otrs.com/
# Copyright (C) 2021 Znuny GmbH, https://znuny.org/
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file COPYING for license information (GPL). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --

use strict;
use warnings;
use utf8;

use vars (qw($Self));

my $Selenium = $Kernel::OM->Get('Kernel::System::UnitTest::Selenium');

$Selenium->RunTest(
    sub {

        my $HelperObject = $Kernel::OM->Get('Kernel::System::UnitTest::Helper');
        my $ConfigObject = $Kernel::OM->Get('Kernel::Config');

        # Make sure to enable cloud services.
        $HelperObject->ConfigSettingChange(
            Valid => 1,
            Key   => 'CloudServices::Disabled',
            Value => 0,
        );

        # Create test user and login.
        my $TestUserLogin = $HelperObject->TestUserCreate(
            Groups => ['admin'],
        ) || die "Did not get test user";

        $Selenium->Login(
            Type     => 'Agent',
            User     => $TestUserLogin,
            Password => $TestUserLogin,
        );

        my $ScriptAlias = $ConfigObject->Get('ScriptAlias');

        # Navigate to AdminSupportDataCollector screen.
        $Selenium->VerifiedGet("${ScriptAlias}index.pl?Action=AdminSupportDataCollector");

        # Check if needed frontend module is registered in sysconfig.
        if ( !$ConfigObject->Get('Frontend::Module')->{AdminSupportDataCollector} ) {
            $Self->True(
                index(
                    $Selenium->get_page_source(),
                    'Module Kernel::Modules::AdminSupportDataCollector not registered in Kernel/Config.pm!'
                ) > 0,
                'Module AdminSupportDataCollector is not registered in sysconfig, skipping test...'
            );

            return 1;
        }

        # Check Widget dropdown on AdminSupportDataCollector screen.
        $Selenium->find_element("//a[contains(\@aria-controls, \'Core_UI_AutogeneratedID_0')]");    # Database
        $Selenium->find_element("//a[contains(\@aria-controls, \'Core_UI_AutogeneratedID_1')]");    # Operating System
        $Selenium->find_element("//a[contains(\@aria-controls, \'Core_UI_AutogeneratedID_2')]");    # OTRS
        $Selenium->find_element("//a[contains(\@aria-controls, \'Core_UI_AutogeneratedID_3')]");    # Webserver

        # Check Generate Support Bundle buttons.
        $Selenium->find_element( "#GenerateSupportBundle", 'css' );
    }
);

1;
