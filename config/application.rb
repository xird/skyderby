require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, Rails.env)

module Skyderby
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    config.assets.paths << "#{Rails}/vendor/assets/fonts"

    # The default locale is :ru and all translations from config/locales/**/*.rb,yml are auto loaded.
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}').to_s]
    config.i18n.available_locales = [:en, :ru, :de, :es]
    config.i18n.default_locale = :en

    config.autoload_paths << Rails.root.join('lib')

    # Currently, Active Record suppresses errors raised within
    # `after_rollback`/`after_commit` callbacks and only print
    # them to the logs. In the next version, these errors will
    # no longer be suppressed. Instead, the errors will propagate
    # normally just like in other Active Record callbacks.
    config.active_record.raise_in_transactional_callbacks = true
  end
end
