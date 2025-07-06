#!/usr/bin/env python3
"""
Virtual Environment Setup Script for TradingBot

This script automatically detects the operating system and architecture,
creates a virtual environment in the /venv folder, and installs the
appropriate requirements based on the system configuration.
"""

import os
import sys
import platform
import subprocess
import shutil
from pathlib import Path


class VenvInitializer:
    """
    A class to handle virtual environment initialization for the TradingBot project.
    """

    def __init__(self):
        """Initialize the VenvInitializer with project root and system info."""
        self.project_root = Path(__file__).parent.parent
        self.venv_path = self.project_root / ".venv"
        self.scripts_path = self.project_root / "scripts"
        self.deps_path = self.scripts_path / "deps"

        # Detect system and architecture
        self.system = self._detect_system()
        self.architecture = self._detect_architecture()

        print(f"Detected system: {self.system}")
        print(f"Detected architecture: {self.architecture}")

    def _detect_system(self) -> str:
        """
        Detect the operating system.

        Returns:
            str: 'linux' or 'windows'
        """
        system = platform.system().lower()
        if system == "linux":
            return "linux"
        elif system == "windows":
            return "windows"
        else:
            raise OSError(f"Unsupported operating system: {system}")

    def _detect_architecture(self) -> str:
        """
        Detect the system architecture.

        Returns:
            str: Architecture string (e.g., 'x86_64')
        """
        machine = platform.machine().lower()
        if machine in ["x86_64", "amd64"]:
            return "x86_64"
        elif machine in ["arm64", "aarch64"]:
            return "arm64"
        else:
            # Default to x86_64 if unsure
            print(f"Warning: Unknown architecture {machine}, defaulting to x86_64")
            return "x86_64"

    def get_python_executable(self) -> str:
        """
        Get the appropriate Python executable path.

        Returns:
            str: Python executable path
        """
        return sys.executable

    def get_requirements_file(self) -> Path:
        """
        Get the path to the appropriate requirements file based on system and architecture.

        Returns:
            Path: Path to the requirements.txt file

        Raises:
            FileNotFoundError: If the requirements file doesn't exist
        """
        requirements_path = self.deps_path / self.system / self.architecture / "requirements.txt"

        if not requirements_path.exists():
            raise FileNotFoundError(
                f"Requirements file not found: {requirements_path}\n"
                f"Available systems: {[d.name for d in self.deps_path.iterdir() if d.is_dir()]}"
            )

        return requirements_path

    def _get_python_executable(self) -> str:
        """
        Get the appropriate Python executable path (deprecated - use get_python_executable).

        Returns:
            str: Python executable path
        """
        return self.get_python_executable()

    def _get_requirements_file(self) -> Path:
        """
        Get requirements file path (deprecated - use get_requirements_file).

        Returns:
            Path: Path to the requirements.txt file
        """
        return self.get_requirements_file()

    def _run_command(self, command: list, description: str) -> None:
        """
        Run a shell command with error handling.

        Args:
            command: List of command arguments
            description: Description of what the command does

        Raises:
            subprocess.CalledProcessError: If command fails
        """
        print(f"{description}...")
        try:
            result = subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True
            )
            if result.stdout:
                print(result.stdout)
        except subprocess.CalledProcessError as e:
            print(f"Error: {description} failed")
            print(f"Command: {' '.join(command)}")
            print(f"Error output: {e.stderr}")
            raise

    def remove_existing_venv(self) -> None:
        """Remove existing virtual environment if it exists."""
        if self.venv_path.exists():
            print(f"Removing existing virtual environment at {self.venv_path}")
            shutil.rmtree(self.venv_path)

    def create_venv(self) -> None:
        """Create a new virtual environment."""
        python_exe = self.get_python_executable()
        command = [python_exe, "-m", "venv", str(self.venv_path)]
        self._run_command(command, "Creating virtual environment")

    def get_venv_pip(self) -> str:
        """
        Get the path to pip in the virtual environment.

        Returns:
            str: Path to pip executable
        """
        if self.system == "windows":
            return str(self.venv_path / "Scripts" / "pip.exe")
        else:
            return str(self.venv_path / "bin" / "pip")

    def upgrade_pip(self) -> None:
        """Upgrade pip in the virtual environment."""
        pip_exe = self.get_venv_pip()
        command = [pip_exe, "install", "--upgrade", "pip"]
        self._run_command(command, "Upgrading pip")

    def install_requirements(self) -> None:
        """Install requirements from the appropriate requirements file."""
        requirements_file = self.get_requirements_file()
        pip_exe = self.get_venv_pip()

        print(f"Installing requirements from: {requirements_file}")
        command = [pip_exe, "install", "-r", str(requirements_file)]
        self._run_command(command, "Installing requirements")

    def verify_installation(self) -> None:
        """Verify that key packages are installed correctly."""
        pip_exe = self.get_venv_pip()

        # Check some key packages
        key_packages = ["fastapi", "uvicorn", "luno-python", "pandas"]

        print("Verifying installation...")
        for package in key_packages:
            try:
                command = [pip_exe, "show", package]
                result = subprocess.run(command, capture_output=True, text=True, check=True)
                if result.stdout:
                    print(f"✓ {package} installed successfully")
                else:
                    print(f"✗ {package} not found")
            except subprocess.CalledProcessError:
                print(f"✗ {package} not found")

    def create_activation_script(self) -> None:
        """Create platform-specific activation scripts."""
        if self.system == "windows":
            activate_script = self.project_root / "activate_venv.bat"
            script_content = f"""@echo off
echo Activating TradingBot virtual environment...
call "{self.venv_path}\\Scripts\\activate.bat"
"""
        else:
            activate_script = self.project_root / "activate_venv.sh"
            script_content = f"""#!/bin/bash
echo "Activating TradingBot virtual environment..."
source "{self.venv_path}/bin/activate"
"""

        with open(activate_script, "w", encoding="utf-8") as f:
            f.write(script_content)

        if self.system != "windows":
            os.chmod(activate_script, 0o755)

        print(f"Created activation script: {activate_script}")

    def print_usage_instructions(self) -> None:
        """Print instructions on how to use the virtual environment."""
        print("\n" + "="*60)
        print("VIRTUAL ENVIRONMENT SETUP COMPLETE!")
        print("="*60)

        if self.system == "windows":
            activate_cmd = f"{self.venv_path}\\Scripts\\activate.bat"
            print("To activate the virtual environment, run:")
            print(f"  {activate_cmd}")
            print("Or use the convenience script:")
            print("  activate_venv.bat")
        else:
            activate_cmd = f"source {self.venv_path}/bin/activate"
            print("To activate the virtual environment, run:")
            print(f"  {activate_cmd}")
            print("Or use the convenience script:")
            print("  source activate_venv.sh")

        print("\nTo deactivate, simply run:")
        print("  deactivate")

        print(f"\nVirtual environment location: {self.venv_path}")
        print("="*60)

    def initialize(self, force: bool = False) -> None:
        """
        Initialize the virtual environment.

        Args:
            force: If True, remove existing venv before creating new one
        """
        try:
            print("Starting TradingBot virtual environment initialization...")
            print(f"Project root: {self.project_root}")

            if force or self.venv_path.exists():
                self.remove_existing_venv()

            self.create_venv()
            self.upgrade_pip()
            self.install_requirements()
            self.verify_installation()
            self.create_activation_script()
            self.print_usage_instructions()

        except (subprocess.CalledProcessError, FileNotFoundError, OSError) as e:
            print(f"Failed to initialize virtual environment: {e}")
            sys.exit(1)


def main():
    """Main function to run the virtual environment initialization."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Initialize virtual environment for TradingBot"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force recreation of virtual environment if it exists"
    )
    parser.add_argument(
        "--system-info",
        action="store_true",
        help="Show system information and exit"
    )

    args = parser.parse_args()

    initializer = VenvInitializer()

    if args.system_info:
        print(f"System: {initializer.system}")
        print(f"Architecture: {initializer.architecture}")
        print(f"Python executable: {initializer.get_python_executable()}")
        print(f"Requirements file: {initializer.get_requirements_file()}")
        return

    initializer.initialize(force=args.force)


if __name__ == "__main__":
    main()