# -*- encoding : utf-8 -*-
require 'open3'
require 'yaml'

namespace :devops do
  namespace :provision do
    namespace :ami do
      desc "Provision a new base ami"
      task :base, [:env] do |t, args|
        PackerRunner.new(args[:env]).execute("provisioning/packer/base.json")
      end

      %w{ service web-accelerator go-agent report }.each do |ami|
        desc "Provision a new #{ami} ami"
        name = ami.gsub('_', '-')
        task name, [:env] do |t, args|
          PackerRunner.new(args[:env]).execute("provisioning/packer/#{name}.json")
        end
      end
    end


    namespace :host do
      %w{ go-agent mongodb }.each do |playbook|
        desc "Provision #{playbook} in live servers"
        name = playbook.gsub('_', '-')
        task name, [:env] do |t, args|
          AnsibleRunner.new(args[:env]).execute_playbook("provisioning/#{name}.yml")
        end
      end

      %w{ service web-accelerator }.each do |playbook|
        desc "Provision #{playbook} in live servers"
        name = playbook.gsub('_', '-')
        task name, [:pool, :env] do |t, args|
          AnsibleRunner.new(args[:env]).execute_playbook("provisioning/#{name}.yml", ["pool=#{args[:pool]}"])
        end
      end
    end
  end
end
